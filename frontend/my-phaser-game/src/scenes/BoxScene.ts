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
  private socket!: Socket;
  private otherPlayers: { [id: string]: Phaser.Physics.Arcade.Sprite } = {};

  constructor() {
    super({ key: "BoxScene" });
  }

  preload() {
    // Load any assets here if needed
    this.load.image("char_down", 'src/assets/char_behind.png');
    this.load.image("char_up", 'src/assets/char_front.png');
    this.load.image("char_left", 'src/assets/char_left.png');
    this.load.image("char_right", 'src/assets/char_right.png');
    this.load.image("bullet", 'src/assets/test_bullet.png');
    this.load.image("map", 'src/assets/roomSB.png');
  }

  create() {
    // Create the background (map)
    this.add.image(0, 0, 'map').setOrigin(0, 0);

    // Initialize the player's sprite
    this.box = this.physics.add.sprite(400, 300, "char_down");
    this.box.setBounce(0.2);
    this.box.setCollideWorldBounds(true);

    // Create cursor keys for movement
    this.cursors = this.input!.keyboard!.createCursorKeys();

    // Display concentration
    this.concentrationText = this.add.text(16, 16, 'Konzentration: 100%', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);

    // Initialize bullets group
    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });

    // Key for shooting
    this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Initialize socket connection
    this.socket = io("http://10.0.40.186:3001"); // Adresse des Servers

    this.socket.on("connect", () => {
      console.log("Verbunden mit Server:", this.socket.id);
    });

    // Listen for other players' movements
    this.socket.on("otherPlayerMove", (data) => {
      this.updateOtherPlayerPosition(data.id, data.x, data.y, data.direction);
    });

    // Listen for new players
    this.socket.on("newPlayer", (data) => {
      this.createOtherPlayer(data.id, data.x, data.y);
    });

    // Listen for player disconnects
    this.socket.on("playerDisconnect", (id) => {
      this.removeOtherPlayer(id);
    });
  }

  shootBullet() {
    const bullet = this.bullets.get(this.box.x, this.box.y, "bullet") as Phaser.Physics.Arcade.Image;

    if (!bullet) return;

    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setCollideWorldBounds(true);

    const speed = 600;
    switch (this.currentDirection) {
      case "up":
        bullet.setVelocity(0, -speed);
        break;
      case "down":
        bullet.setVelocity(0, speed);
        break;
      case "left":
        bullet.setVelocity(-speed, 0);
        break;
      case "right":
        bullet.setVelocity(speed, 0);
        break;
    }

    this.loseConcentration(5);

    // Bullet verschwindet nach 2 Sekunden
    this.time.delayedCall(2000, () => {
      bullet.destroy();
    });
  }

  loseConcentration(amount: number) {
    this.concentration -= amount;
    if (this.concentration < 0) this.concentration = 0;

    this.concentrationText.setText(`Konzentration: ${this.concentration}%`);

    if (this.concentration <= 0) {
      this.handleGameOver();
    }
  }

  handleGameOver() {
    this.physics.pause();
    this.box.setTint(0xff0000);
    this.concentrationText.setText('Konzentration: 0% - Du bist raus!');
  }

  update() {
    // X-Bewegung
    if (this.cursors.left.isDown) {
      this.box.setVelocityX(-160);
      this.box.setTexture('char_left');
      this.currentDirection = "left";
    } else if (this.cursors.right.isDown) {
      this.box.setVelocityX(160);
      this.box.setTexture('char_right');
      this.currentDirection = "right";
    } else {
      this.box.setVelocityX(0);
    }

    // Y-Bewegung
    if (this.cursors.up.isDown) {
      this.box.setVelocityY(-160);
      this.box.setTexture('char_down');
      this.currentDirection = "up";
    } else if (this.cursors.down.isDown) {
      this.box.setVelocityY(160);
      this.box.setTexture('char_up');
      this.currentDirection = "down";
    } else {
      this.box.setVelocityY(0);
    }

    // Send player position to server
    this.socket.emit("playerMove", {
      id: this.socket.id,
      x: this.box.x,
      y: this.box.y,
      direction: this.currentDirection
    });

    // Schießen mit Leertaste
    if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
      this.shootBullet();
    }
  }

  // Create other player
  createOtherPlayer(id: string, x: number, y: number) {
    this.otherPlayers[id] = this.physics.add.sprite(x, y, "char_down");
    this.otherPlayers[id].setCollideWorldBounds(true);
  }

  // Update other player's position
  updateOtherPlayerPosition(id: string, x: number, y: number, direction: string) {
    if (!this.otherPlayers[id]) return;

    this.otherPlayers[id].setPosition(x, y);

    // Set texture based on direction
    switch (direction) {
      case "up":
        this.otherPlayers[id].setTexture("char_up");
        break;
      case "down":
        this.otherPlayers[id].setTexture("char_down");
        break;
      case "left":
        this.otherPlayers[id].setTexture("char_left");
        break;
      case "right":
        this.otherPlayers[id].setTexture("char_right");
        break;
    }
  }

  // Remove other player
  removeOtherPlayer(id: string) {
    if (this.otherPlayers[id]) {
      this.otherPlayers[id].destroy();
      delete this.otherPlayers[id];
    }
  }
}
