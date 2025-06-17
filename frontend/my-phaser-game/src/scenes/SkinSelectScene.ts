import Phaser from "phaser";

export default class SkinSelectScene extends Phaser.Scene {
  private selectedSkin: string = "char1";
  private skins: string[] = ["ralph", "pepe", "Peter_H", "caretaker", "fox", "alien"];


  constructor() {
    super({ key: "SkinSelectScene" });
  }

  preload() {
    for (const skin of this.skins) {
      this.load.image(`${skin}_preview`, `src/assets/char/${skin}_left.png`);
    }
  }

  create() {

    this.add.text(400, 50, "Wähle deinen Charakter", { fontSize: "32px", color: "#fff" }).setOrigin(0.5);

    this.skins.forEach((skin, index) => {
      const x = 300 + index * 150;
      const y = 200;
      const preview = this.add.image(x, y, `${skin}_preview`).setInteractive().setScale(1.5);
      preview.on("pointerdown", () => {
        this.selectedSkin = skin;
        this.scene.start("BoxScene", {
          selectedSkin: skin
        });
      });

      this.add.text(x, y + 80, skin, { fontSize: "16px", color: "#fff" }).setOrigin(0.5);
    });
  }
}
