class GameLobby {
    constructor(id, name, maxPlayers, io) {
        this.id = id;
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.io = io;
        this.players = new Map();
    }

    addPlayer(socket) {

        if (socket._lobbySetupDone) return;
        socket._lobbySetupDone = true;

        socket.join(this.id);

        this.players[socket.id] = {
            id: socket.id,
            x: 30,
            y: 30,
            dir: 'front',
            skin: 'char1',
            alive: true,
            kills: 0
        };

        console.log(`Neuer Spieler ${socket.id} in Lobby ${this.id}`);

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
            const shooter = this.players[socket.id];
            data.shooterSkin = shooter?.skin || 'default';

            if (!player || !player.alive) return;
            socket.to(this.id).emit("playerShot", { id: socket.id, ...data });
        });

        socket.on("playerHit", ({ shooterId, targetId }) => {
            const target = this.players[targetId];
            if (target) {
                // 1. Schaden berechnen
                const damage = 25;
                target.concentration = Math.max(0, (target.concentration || 100) - damage);
                target.lastHitBy = shooterId;

                // 2. An alle Spieler senden
                this.io.to(this.id).emit("playerWasHit", {
                    targetId,
                    newConcentration: target.concentration // WICHTIG: Neuer Wert
                });

                // 3. Bestätigungen senden
                this.io.to(shooterId).emit("hitConfirmed", { targetId });
                this.io.to(targetId).emit("playerDamaged", { damage });

                // 4. Bei 0 Concentration: Spieler töten
                if (target.concentration <= 0) {
                    this.io.to(targetId).emit("youAreDead");
                    this.io.to(this.id).emit("playerDied", {
                        id: targetId,
                        angle: 90
                    });
                }
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

        socket.on("playerHealed", (amount) => {
            const player = this.players[socket.id];
            if (player) {
                player.concentration = Math.min(100, (player.concentration || 100) + amount);
                this.io.to(this.id).emit("playerWasHealed", {
                    playerId: socket.id,
                    newConcentration: player.concentration
                });
            }
        });
        this.broadcastLobbyStatus();

        if (this.playerCount() >= Math.ceil(this.maxPlayers / 2)) {
            this.startCountdown();
        }

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
    startCountdown(durationInSeconds = 5) {
        if (this._countdownInterval) return;

        let timeLeft = durationInSeconds;
        this.io.to(this.id).emit("lobbyStatusUpdate", {
            players: this.playerCount(),
            maxPlayers: this.maxPlayers,
            countdown: timeLeft
        });

        this._countdownInterval = setInterval(() => {
            timeLeft--;
            this.io.to(this.id).emit("lobbyStatusUpdate", {
                players: this.playerCount(),
                maxPlayers: this.maxPlayers,
                countdown: timeLeft
            });

            if (timeLeft <= 0) {
                clearInterval(this._countdownInterval);
                this._countdownInterval = null;
                this.io.to(this.id).emit("gameStart", { lobbyId: this.id });
            }
        }, 1000);
    }

    broadcastLobbyStatus() {
        this.io.to(this.id).emit("lobbyStatusUpdate", {
            players: this.playerCount(),
            maxPlayers: this.maxPlayers,
            countdown: this._countdownInterval ? true : false,
        });
    }

}

module.exports = GameLobby;
