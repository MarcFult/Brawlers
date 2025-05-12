class GameLobby {
    constructor(id, name, maxPlayers, io) {
        this.id = id;
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.io = io;
        this.players = {};
    }

    addPlayer(socket) {

        if (socket._lobbySetupDone) return;
        socket._lobbySetupDone = true;

        socket.join(this.id);

        // INITIALE SPIELERDATEN MIT POSITIONEN
        this.players[socket.id] = {
            id: socket.id,
            x: Math.random() * 500 + 100, // Zufällige Startposition
            y: Math.random() * 500 + 100,
            dir: 'front',
            skin: 'char1',
            alive: true,
            kills: 0
        };

        console.log(`Neuer Spieler ${socket.id} in Lobby ${this.id}`);

        // WICHTIG: Sofortige Benachrichtigung an ALLE Spieler
        this.io.to(this.id).emit("currentPlayers", this.players);

        socket.on("playerJoined", (data) => {
            this.players[socket.id] = {
                ...this.players[socket.id],
                ...data,
                skin: data.skin || 'char1'
            };
            console.log(`Spielerupdate ${socket.id}:`, this.players[socket.id]);
            this.io.to(this.id).emit("playerUpdated", this.players[socket.id]);
        });

        socket.on("playerMoved", (data) => {
            const player = this.players[socket.id];
            if (!player || !player.alive) return;
            this.players[socket.id] = { ...player, ...data };
            socket.to(this.id).emit("playerMoved", { id: socket.id, ...data, skin: player.skin });

        });

        socket.on("playerShot", (data) => {
            const player = this.players[socket.id];
            if (!player || !player.alive) return;
            socket.to(this.id).emit("playerShot", { id: socket.id, ...data });
        });

        socket.on("playerHit", ({ shooterId, targetId }) => {
            const target = this.players[targetId];
            if (target) {
                target.lastHitBy = shooterId;
                this.io.to(this.id).emit("playerWasHit", { targetId });
                this.io.to(shooterId).emit("hitConfirmed", { targetId });
                this.io.to(targetId).emit("playerDamaged", { damage: 25 });
            }
        });

        socket.on("playerDead", () => {
            const player = this.players[socket.id];
            if (player) {
                player.alive = false;
                const killerId = player.lastHitBy;
                if (killerId && this.players[killerId]) {
                    this.players[killerId].kills += 1;
                    this.io.to(killerId).emit("updateKills", { kills: this.players[killerId].kills });
                }

                socket.emit("youAreDead");
                socket.to(this.id).emit("playerDied", { id: socket.id, angle: 90 });
            }
        });

        socket.on("disconnect", () => {
            this.removePlayer(socket.id);
            this.io.to(this.id).emit("playerDisconnected", socket.id);
        });
    }

    removePlayer(socketId) {
        delete this.players[socketId];
    }

    playerCount() {
        return Object.keys(this.players).length;
    }

    hasSpace() {
        return this.playerCount() < this.maxPlayers;
    }

    isEmpty() {
        return this.playerCount() === 0;
    }
}

module.exports = GameLobby;
