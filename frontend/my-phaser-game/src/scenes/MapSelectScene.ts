import Phaser from "phaser";

export default class MapSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: "MapSelectScene" });
    }

    preload() {
        this.load.image("preview1", "src/assets/first_map.png");
        this.load.image("preview2", "src/assets/second_map.png");
        this.load.image("preview3", "src/assets/third_map.png");
        this.load.image("preview4", "src/assets/ah.png");
        this.load.image("preview5", "src/assets/fourth_map.png")

    }

    create() {
        this.add.text(100, 50, "Wähle eine Map:", { fontSize: "32px", color: "#fff" });

        const map1 = this.add.image(200, 200, "preview1").setInteractive().setScale(0.3);
        const map2 = this.add.image(500, 200, "preview2").setInteractive().setScale(0.3);
        const map3 = this.add.image(800, 200, "preview3").setInteractive().setScale(0.3);
        const map4 = this.add.image(200, 600, "preview4").setInteractive().setScale(0.3);
        const map5 = this.add.image(500, 600, "preview5").setInteractive().setScale(0.3);



        map1.on("pointerdown", () => {
            this.scene.start("SkinSelectScene", { selectedMap: "first_map" });
        });

        map2.on("pointerdown", () => {
            this.scene.start("SkinSelectScene", { selectedMap: "second_map" });
        });

        map3.on("pointerdown", () => {
            this.scene.start("SkinSelectScene", { selectedMap: "third_map" });
        });

        map4.on("pointerdown", () => {
            this.scene.start("SkinSelectScene", { selectedMap: "ah" });
        });

        map5.on("pointerdown", () => {
            this.scene.start("SkinSelectScene", { selectedMap: "fourth_map" });
        });
    }
}
