import Phaser from "phaser";

export default class BoxScene extends Phaser.Scene {
  private box!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bullets: Phaser.Physics.Arcade.Group;
  private shootKey: any;
  private currentDirection: string = "down";

  constructor() {
    super({ key: "BoxScene" });
  }

  preload() {
    // Load any assets here if needed
    this.load.image("char_down", 'src/assets/char_behind.png')
    this.load.image("char_up", 'src/assets/char_front.png')
    this.load.image("char_left", 'src/assets/char_left.png')
    this.load.image("char_right", 'src/assets/char_right.png')

    this.load.image("bullet", 'src/assets/test_bullet.png')

    this.load.image("map", 'src/assets/roomSB.png')

  }

  create() {
    // Create the charactera
    this.add.image(0, 0, 'map').setOrigin(0,0);

    this.box = this.physics.add.sprite(400, 300, "char_down");
    this.box.setBounce(0.2);
    this.box.setCollideWorldBounds(true);

    // Create cursor keys
    this.cursors = this.input!.keyboard!.createCursorKeys();

    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });

    this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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

    // Bullet verschwindet nach 2 Sekunden
    this.time.delayedCall(2000, () => {
      bullet.destroy();
    });
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

    // Schießen mit Leertaste
    if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
      this.shootBullet();
    }
  }

}

