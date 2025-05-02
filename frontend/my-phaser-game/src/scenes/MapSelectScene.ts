import Phaser from "phaser";

export default class MapSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: "MapSelectScene" });
    }

    preload() {
        this.load.image("preview1", "src/assets/first_map.png");
        this.load.image("preview2", "src/assets/second_map.png");
    }

    create() {
        this.add.text(100, 50, "Wähle eine Map:", { fontSize: "32px", color: "#fff" });

        const map1 = this.add.image(200, 200, "preview1").setInteractive().setScale(0.3);
        const map2 = this.add.image(500, 200, "preview2").setInteractive().setScale(0.3);

        map1.on("pointerdown", () => {
            this.scene.start("BoxScene", { selectedMap: "first_map" });
        });

        map2.on("pointerdown", () => {
            this.scene.start("BoxScene", { selectedMap: "second_map" });
        });
    }
}
