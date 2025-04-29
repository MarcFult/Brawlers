import Phaser from "phaser";
import { io, Socket } from "socket.io-client";

export default class BoxScene extends Phaser.Scene {
  private box!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bullets: Phaser.Physics.Arcade.Group;
  private shootKey: any;
  private currentDirection: string = "down";
  private concentration: number = 100;
  private concentrationText!: Phaser.GameObjects.Text;
  private isGameOver: boolean = false;

  private socket!: Socket;
  private otherPlayers: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!:  Phaser.Physics.Arcade.Group;

  constructor() {
    super({ key: "BoxScene" });
  }
  preload() {
    this.load.image("char_down", 'src/assets/char_behind.png')
    this.load.image("char_up", 'src/assets/char_front.png')
    this.load.image("char_left", 'src/assets/char_left.png')
    this.load.image("char_right", 'src/assets/char_right.png')
    this.load.image("bullet", 'src/assets/test_bullet.png')
    this.load.image("test_map", 'src/assets/roomSB.png')
    this.load.image("first_map", 'src/assets/first_map.png')
  }

  create() {
    this.add.image(0, 0, 'first_map').setOrigin(0,0);

    this.cameras.main.setBounds(0, 0, 1134, 1110);
    this.physics.world.setBounds(0, 0, 1134, 1110);

    this.box = this.physics.add.sprite(30, 30, "char_down");
    this.box.setBounce(0.2);
    this.box.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.concentrationText = this.add.text(16, 16, 'Konzentration: 100%', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);

    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });

    this.socket = io("http://10.0.40.186:3001");

    this.socket.emit("playerJoined", { x: this.box.x, y: this.box.y, dir: this.currentDirection });

    this.socket.on("currentPlayers", (players: any) => {
      for (const id in players) {
        if (id !== this.socket.id) {
          this.addOtherPlayer(players[id]);
        }
      }
    });

    this.socket.on("newPlayer", (player: any) => {
      this.addOtherPlayer(player);
    });

    this.socket.on("playerMoved", (data: any) => {
      const other = this.otherPlayers.get(data.id);
      if (other) {
        other.setPosition(data.x, data.y);
        other.setTexture(this.getTextureFromDirection(data.dir));
      }
    });

    this.socket.on("playerDisconnected", (id: string) => {
      const other = this.otherPlayers.get(id);
      if (other) {
        other.destroy();
        this.otherPlayers.delete(id);
      }
    });

    this.socket.on("playerShot", (data: any) => {
      const shooter = this.otherPlayers.get(data.id);
      if (!shooter) return;

      const bullet = this.enemyBullets.create(data.x, data.y, "bullet") as Phaser.Physics.Arcade.Image;
      (bullet as any).shooterId = data.id;

      bullet.setActive(true).setVisible(true).setCollideWorldBounds(true);
      bullet.setVelocity(data.velocity.x, data.velocity.y);
      this.time.delayedCall(2000, () => bullet.destroy());
    });

    this.playerBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });

    this.enemyBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });

    this.physics.add.overlap(this.box, this.enemyBullets, this.handlePlayerHit, undefined, this);


    this.socket.on("hitConfirmed", (data: any) => {
      if (data.targetId === this.socket.id) {
        this.loseConcentration(25);
      }
    });

  }

  shootBullet() {
    if (this.isGameOver) return; //tote dürfen nicht schießen

    const bullet = this.playerBullets.create(this.box.x, this.box.y, "bullet") as Phaser.Physics.Arcade.Image;
    if (!bullet) return;

    bullet.setActive(true).setVisible(true).setCollideWorldBounds(true);

    const baseSpeed = 600;
    let velocity = { x: 0, y: 0 };

    const up = this.cursors.up.isDown;
    const down = this.cursors.down.isDown;
    const left = this.cursors.left.isDown;
    const right = this.cursors.right.isDown;

    if (up && left) {
      velocity.x = -baseSpeed / Math.sqrt(2);
      velocity.y = -baseSpeed / Math.sqrt(2);
    } else if (up && right) {
      velocity.x = baseSpeed / Math.sqrt(2);
      velocity.y = -baseSpeed / Math.sqrt(2);
    } else if (down && left) {
      velocity.x = -baseSpeed / Math.sqrt(2);
      velocity.y = baseSpeed / Math.sqrt(2);
    } else if (down && right) {
      velocity.x = baseSpeed / Math.sqrt(2);
      velocity.y = baseSpeed / Math.sqrt(2);
    } else if (up) {
      velocity.y = -baseSpeed;
    } else if (down) {
      velocity.y = baseSpeed;
    } else if (left) {
      velocity.x = -baseSpeed;
    } else if (right) {
      velocity.x = baseSpeed;
    } else {
      switch (this.currentDirection) {
        case "up": velocity.y = -baseSpeed; break;
        case "down": velocity.y = baseSpeed; break;
        case "left": velocity.x = -baseSpeed; break;
        case "right": velocity.x = baseSpeed; break;
      }
    }

    bullet.setVelocity(velocity.x, velocity.y);

    this.socket.emit("playerShot", {
      x: this.box.x,
      y: this.box.y,
      velocity: { x: velocity.x, y: velocity.y }
    });

    this.time.delayedCall(2000, () => bullet.destroy());
  }



  loseConcentration(amount: number) {
    this.concentration = Math.max(0, this.concentration - amount);
    this.concentrationText.setText(`Konzentration: ${this.concentration}%`);

    if (this.concentration <= 0 && !this.isGameOver) {
      this.socket.emit("playerDead"); // Server informieren
      this.handleGameOver();
    }
  }

  handleGameOver() {
    this.box.setActive(false).setVisible(true);
    this.box.setTint(0xff0000);
    this.isGameOver = true;
    this.concentrationText.setText('Konzentration: 0% - Du bist raus!');
  }

  update() {
    if (this.isGameOver) return;

    let moved = false;

    if (this.cursors.left.isDown) {
      this.box.setVelocityX(-160);
      this.box.setTexture('char_left');
      this.currentDirection = "left";
      moved = true;
    } else if (this.cursors.right.isDown) {
      this.box.setVelocityX(160);
      this.box.setTexture('char_right');
      this.currentDirection = "right";
      moved = true;
    } else {
      this.box.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.box.setVelocityY(-160);
      this.box.setTexture('char_down');
      this.currentDirection = "up";
      moved = true;
    } else if (this.cursors.down.isDown) {
      this.box.setVelocityY(160);
      this.box.setTexture('char_up');
      this.currentDirection = "down";
      moved = true;
    } else {
      this.box.setVelocityY(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
      this.shootBullet();
    }

    if (moved) {
      this.socket.emit("playerMoved", { x: this.box.x, y: this.box.y, dir: this.currentDirection });
    }
  }

  private addOtherPlayer(data: any) {
    const sprite = this.physics.add.sprite(data.x, data.y, this.getTextureFromDirection(data.dir || "down"));
    sprite.setTint(0x00ff00);
    this.otherPlayers.set(data.id, sprite);
  }

  private getTextureFromDirection(dir: string): string {
    switch (dir) {
      case "up": return "char_down";
      case "down": return "char_up";
      case "left": return "char_left";
      case "right": return "char_right";
      default: return "char_down";
    }
  }



  private handlePlayerHit(player: Phaser.GameObjects.GameObject, bullet: Phaser.GameObjects.GameObject) {
    bullet.destroy();

    this.loseConcentration(25);

    this.tweens.add({
      targets: this.box,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
  }

}
