import {Socket} from "socket.io-client";

export default class WinScene extends Phaser.Scene {
    private socket!: Socket;

    constructor() {
        super({ key: "WinScene" });
    }

    init(data: { socket: Socket }) {
        this.socket = data.socket;
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