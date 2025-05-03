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
  private concentrationSprite!: Phaser.GameObjects.Image;
  private isGameOver: boolean = false;
  private kills: number = 0;
  private killText!: Phaser.GameObjects.Text;
  private killSprite!: Phaser.GameObjects.Image;
  private selectedMap: string = 'first_map';
  private selectedSkin: string = 'char1';

  private socket!: Socket;
  private otherPlayers: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!:  Phaser.Physics.Arcade.Group;

  constructor() {
    super({ key: "BoxScene" });
  }

  init(data: any) {
    this.selectedMap = data.selectedMap || 'first_map';
    this.selectedSkin = data.selectedSkin || 'char1'; // fallback
  }

  preload() {
    this.load.image("bullet", 'src/assets/test_bullet.png')
    this.load.image("test_map", 'src/assets/roomSB.png')
    this.load.image("first_map", 'src/assets/first_map.png')
    this.load.image("second_map", 'src/assets/second_map.png')
    this.load.image("con_0", "src/assets/con_0.png");
    this.load.image("con_25", "src/assets/con_25.png");
    this.load.image("con_50", "src/assets/con_50.png");
    this.load.image("con_75", "src/assets/con_75.png");
    this.load.image("con_100", "src/assets/con_100.png");
    this.load.image("kill_buddy", "src/assets/char_kill.png")

    //Skins
    const skins = ["char1", "ralph"];

    for (const skin of skins) {
      this.load.image(`${skin}_front`, `src/assets/char/${skin}_front.png`);
      this.load.image(`${skin}_back`, `src/assets/char/${skin}_back.png`);
      this.load.image(`${skin}_left`, `src/assets/char/${skin}_left.png`);
      this.load.image(`${skin}_right`, `src/assets/char/${skin}_right.png`);
    }
  }

  create() {
    this.add.image(0, 0, this.selectedMap).setOrigin(0,0);

    this.cameras.main.setBounds(0, 0, 1134, 1110);
    this.physics.world.setBounds(53, 160, 1022, 900);

    this.box = this.physics.add.sprite(30, 30, `${this.selectedSkin}_front`);
    this.box.setBounce(0.2);
    this.box.setCollideWorldBounds(true);



    this.cursors = this.input.keyboard.createCursorKeys();
    this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);


    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });

    //this.socket = io("http://10.0.40.186:3001");
    this.socket = io("http://localhost:3001");


    this.socket.emit("playerJoined", { x: this.box.x, y: this.box.y, dir: this.currentDirection, map: this.selectedMap , skin: this.selectedSkin});

    this.socket.on("currentPlayers", (players: any) => {
      for (const id in players) {
        if (id !== this.socket.id) {
          this.addOtherPlayer({ ...players[id], skin: players[id].skin || "char1" }); //idk
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

    this.socket.on("playerDied", (data: any) => {
      const deadPlayer = this.otherPlayers.get(data.id);
      if (deadPlayer) {
        deadPlayer.setTint(0xff0000); // rot einfärben
        deadPlayer.setActive(false).setVisible(true); // optional: nicht mehr beweglich
      }
    });
    this.socket.on("playerWasHit", (data: any) => {

      const hitPlayer = this.otherPlayers.get(data.targetId);
      if (data.targetId === this.socket.id) return; // eigener Schaden wird separat behandelt

      if (hitPlayer) {
        this.tweens.add({
          targets: hitPlayer,
          alpha: 0.5,
          duration: 100,
          yoyo: true
        });
      }
    });

    this.killSprite = this.add.image(450,135, "kill_buddy").setScrollFactor(0).setScale(0.5);
    this.killText = this.add.text(470, 120, '0', {
      fontSize: '20px',
      color: '#ffffff',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);

    this.socket.on("updateKills", (data: any) => {
      this.kills = data.kills;
      this.killText.setText(`${this.kills}`);
    });

    this.concentrationSprite = this.add.image(470, 100, "con_100").setScrollFactor(0).setScale(0.5);

    if (this.selectedMap === "second_map") {
      const tableBorders = this.physics.add.staticGroup();

      tableBorders.create(570, 497, null)
          .setDisplaySize(576, 90)
          .refreshBody()
          .setVisible();

      tableBorders.create(570, 702, null)
          .setDisplaySize(576, 90)
          .refreshBody()
          .setVisible();

      tableBorders.create(570, 905, null)
          .setDisplaySize(576, 90)
          .refreshBody()
          .setVisible();

      // Spieler kann nicht durch
      this.physics.add.collider(this.box, tableBorders);

      this.physics.add.collider(this.playerBullets, tableBorders, (bullet) => bullet.destroy());
      this.physics.add.collider(this.enemyBullets, tableBorders, (bullet) => bullet.destroy());
    }

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
    this.updateConcentrationSprite();

    if (this.concentration <= 0 && !this.isGameOver) {
      this.socket.emit("playerDead"); // Server informieren
      this.handleGameOver();
    }
  }


  //KOOOOOOOKS!!!!!!!!!!!

  handleGameOver() {
    this.box.setActive(false).setVisible(true);
    this.box.setTint(0xff0000);
    this.isGameOver = true;
  }

  update() {
    if (this.isGameOver) return;

    let moved = false;

    if (this.cursors.left.isDown) {
      this.box.setVelocityX(-250);
      this.box.setTexture(`${this.selectedSkin}_left`);
      this.currentDirection = "left";
      moved = true;
    } else if (this.cursors.right.isDown) {
      this.box.setVelocityX(250);
      this.box.setTexture(`${this.selectedSkin}_right`);
      this.currentDirection = "right";
      moved = true;
    } else {
      this.box.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.box.setVelocityY(-250);
      this.box.setTexture(`${this.selectedSkin}_back`);
      this.currentDirection = "up";
      moved = true;
    } else if (this.cursors.down.isDown) {
      this.box.setVelocityY(250);
      this.box.setTexture(`${this.selectedSkin}_front`);
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
    const sprite = this.physics.add.sprite(data.x, data.y, `${data.skin}_${data.dir}`);
    this.otherPlayers.set(data.id, sprite);
  }

  private getTextureFromDirection(dir: string): string {
    return `${this.selectedSkin}_${dir}`;
  }

  private handlePlayerHit(player: Phaser.GameObjects.GameObject, bullet: Phaser.GameObjects.GameObject) {
    bullet.destroy();

    this.loseConcentration(25);

    // Schütze informieren das er getroffen hat
    const shooterId = (bullet as any).shooterId;
    if (shooterId && shooterId !== this.socket.id) {
      this.socket.emit("playerHit", { shooterId, targetId: this.socket.id });
    }

    this.tweens.add({
      targets: this.box,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
  }

  private updateConcentrationSprite() {
    let key = "con_0";
    if (this.concentration > 75) {
      key = "con_100";
    } else if (this.concentration > 50) {
      key = "con_75";
    } else if (this.concentration > 25) {
      key = "con_50";
    } else if (this.concentration > 0) {
      key = "con_25";
    }
    this.concentrationSprite.setTexture(key);
  }

}
