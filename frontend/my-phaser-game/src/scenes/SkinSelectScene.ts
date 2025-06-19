import Phaser from "phaser";

interface InitData {
  skins: string[];
}

export default class SkinSelectScene extends Phaser.Scene {
  private skins: string[] = [];
  private selectedSkin: string = "";

  constructor() {
    super({ key: "SkinSelectScene" });
  }

  init(data: InitData) {
    this.skins = data.skins || [];
    // pick a default so we never start with `""`
    this.selectedSkin = this.skins[0] ?? "";
  }

  preload() {
    for (const skin of this.skins) {
      this.load.image(`${skin}_preview`, `src/assets/char/${skin}_left.png`);
    }
  }

  create() {
    // header text
    this.add
      .text(400, 50, "Wähle deinen Charakter", {
        fontSize: "32px",
        color: "#fff",
      })
      .setOrigin(0.5);

    // dynamic grid of previews
    this.skins.forEach((skin, i) => {
      const x = 200 + i * 150;
      const y = 200;

      const preview = this.add
        .image(x, y, `${skin}_preview`)
        .setInteractive()
        .setScale(1.5);

      preview.on("pointerdown", () => {
        this.selectedSkin = skin;
        // hand off to your next scene (e.g. the game proper)
        this.scene.start("BoxScene", { selectedSkin: skin });
      });

      this.add
        .text(x, y + 80, skin, {
          fontSize: "16px",
          color: "#fff",
        })
        .setOrigin(0.5);
    });
  }
}
