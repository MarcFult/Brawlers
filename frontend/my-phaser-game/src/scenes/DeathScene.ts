import { Socket } from "socket.io-client";

const API_BASE = "http://10.0.40.186:8080";

export default class DeathScene extends Phaser.Scene {
  private socket!: Socket; // Socket.IO Verbindung
  private kills!: number;

  constructor() {
    super({ key: "DeathScene" });
  }

  init(data: { socket: Socket }) {
    // Socket von der BoxScene übergeben
    this.socket = data.socket;
    this.kills = data.kills || 0; // Fallback: 0 Kills
  }

  create() {
    const raw = window.sessionStorage.getItem("dlc-player");
    if (raw) {
      const playerData = JSON.parse(raw) as { userId: number; ects: number };
      const userId = playerData.userId;
      const earnedEcts = 2 + (this.kills || 0) * 5;

      // 1) Show on screen
      this.add
        .text(1134 / 2, 1110 / 2 + 110, `ECTS erhalten: ${earnedEcts}`, {
          fontSize: "28px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5);

      // 2) Send PATCH with credentials, then update cache
      fetch(`${API_BASE}/players/user/${userId}/ects/add`, {
        method: "PATCH",
        credentials: "include", // ← make sure cookies go
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ amount: earnedEcts }),
      })
        .then((r) => {
          if (!r.ok) {
            console.error("ECT‐award failed:", r.status, r.statusText);
            throw new Error("PATCH failed");
          }
          return r.json() as Promise<{ ects: number }>;
        })
        .then(({ ects }) => {
          console.log("Server says new ECTS =", ects);
          // 3) patch your sessionStorage so your SPA shows the updated total immediately
          playerData.ects = ects;
          window.sessionStorage.setItem(
            "dlc-player",
            JSON.stringify(playerData)
          );
        })
        .catch((e) => console.error("ECT‐award network error:", e));
    }

    // 1. Dunkles Overlay
    this.add.rectangle(0, 0, 1134, 1110, 0x000000, 0.8).setOrigin(0);

    // 2. Game Over Text
    this.add
      .text(1134 / 2, 1110 / 2 - 60, "GAME OVER", {
        fontSize: "64px",
        color: "#ff0000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const killsText = this.add
      .text(1134 / 2, 1110 / 2 - 10, `Erzielte Kills: ${this.kills}`, {
        fontSize: "36px",
        color: "#ffcc00",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Kill-Icon daneben
    this.add
      .image(killsText.x - killsText.width / 2 - 30, killsText.y, "kill_buddy")
      .setScale(0.7);

    // 3. Zurück-Button mit Disconnect
    const button = this.add
      .text(1134 / 2, 1110 / 2 + 50, "Zur Lobby", {
        fontSize: "32px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => {
        // 1. Socket disconnecten
        this.socket.disconnect();

        // 2. Zur Lobby weiterleiten
        window.location.href = "lobby.html";
      });

    // Automatischer Disconnect nach Zeitüberschreitung
    this.time.delayedCall(10000, () => {
      // Nach 10 Sekunden
      if (this.socket.connected) {
        this.socket.disconnect();
        window.location.href = "lobby.html";
      }
    });
  }
}
