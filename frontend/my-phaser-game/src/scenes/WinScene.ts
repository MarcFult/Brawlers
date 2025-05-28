import {Socket} from "socket.io-client";

export default class WinScene extends Phaser.Scene {
    private socket!: Socket;
    private kills!: number;


    constructor() {
        super({ key: "WinScene" });
    }

    init(data: { socket: Socket }) {
        this.socket = data.socket;
        this.kills = data.kills || 0; // Fallback: 0 Kills
    }

    create() {
        //  Goldener Hintergrund
        this.add.rectangle(0, 0, 1134, 1110, 0xFFD700, 0.7)
            .setOrigin(0);

        //  Sieg-Text mit Krone
        this.add.text(1134/2, 1110/2 - 100, "GEWONNEN!", {
            fontSize: "72px",
            color: "#000000",
            fontStyle: "bold",
            stroke: "#ffffff",
            strokeThickness: 5
        }).setOrigin(0.5);

        const killsText = this.add.text(1134/2, 1110/2 - 10, `Erzielte Kills: ${this.kills}`, {
            fontSize: "36px",
            color: "#ffcc00",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);

        // Kill-Icon daneben
        this.add.image(killsText.x - killsText.width/2 - 30, killsText.y, "kill_buddy")
            .setScale(0.7);

        //  Zurück-Button
        const button = this.add.text(1134/2, 1110/2 + 50, "Zur Lobby zurückkehren", {
            fontSize: "32px",
            color: "#000000",
            backgroundColor: "#ffffff",
            padding: { x: 30, y: 15 }
        })
            .setOrigin(0.5)
            .setInteractive()
            .on("pointerdown", () => {
                this.socket.disconnect();
                window.location.href = "lobby.html";
            });

        // Automatischer Redirect nach 10s
        this.time.delayedCall(10000, () => {
            if (this.socket.connected) {
                this.socket.disconnect();
                window.location.href = "lobby.html";
            }
        });

        // Konfetti-Effekt (optional)
        this.add.particles(0, 0, "bullet", {
            speed: 100,
            scale: { start: 0.5, end: 0 },
            blendMode: "ADD",
            emitting: true
        }).setDepth(100);
    }
}