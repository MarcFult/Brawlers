import Phaser from "phaser";

export default class BoxScene extends Phaser.Scene {
  private box!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: "BoxScene" });
  }

  preload() {
    // Load any assets here if needed
  }

  create() {
    // Create a simple box texture
    this.textures.addBase64(
      "box",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA" +
        "AAAFCAYAAACNbyblAAAAHElEQVQI12P4" +
        "//8/w38GIAXDIBKE0DHxgljNBAAO" +
        "9TXL0Y4OHwAAAABJRU5ErkJggg=="
    );

    // Create the box
    this.box = this.physics.add.sprite(400, 300, "box");
    this.box.setBounce(0.2);
    this.box.setCollideWorldBounds(true);

    // Create cursor keys
    this.cursors = this.input!.keyboard!.createCursorKeys();
  }

  update() {
    // Move the box with arrow keys
    if (this.cursors.left.isDown) {
      this.box.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.box.setVelocityX(160);
    } else {
      this.box.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.box.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.box.setVelocityY(160);
    } else {
      this.box.setVelocityY(0);
    }
  }
}
