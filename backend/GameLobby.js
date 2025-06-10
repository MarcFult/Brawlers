class GameLobby {

    constructor(id, name, maxPlayers, io) {
        this.id = id;
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.io = io;
        this.players = new Map();
        this.cleanupTimeout = null;
        this.lobbyManager = null;

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

        this.players.set(socket.id, { socket });
        if (this.cleanupTimeout) {
            clearTimeout(this.cleanupTimeout); // Cleanup abbrechen, wenn wieder Spieler da
            this.cleanupTimeout = null;
        }

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

                // 🛡️ Wenn Shield aktiv ist: keinen Schaden!
                if (target.shieldActive) {
                    return;
                }


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
        socket.on("playerHitByNpc", ({ targetId }) => {
            const target = this.players[targetId];
            if (target && target.alive) {
                const damage = 25;
                target.concentration = Math.max(0, (target.concentration || 100) - damage);

                this.io.to(this.id).emit("playerWasHit", {
                    targetId,
                    newConcentration: target.concentration,
                });

                this.io.to(targetId).emit("playerDamaged", { damage });

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

        if (!this.countdownInterval && this.playerCount() >= Math.ceil(this.maxPlayers / 2)) {
            this.startCountdown(25);
        }

        socket.on("lobbyListUpdate", (lobbies) => {
            renderLobbies(lobbies); // nutzt `countdown` mit
        });



        socket.on("playerGotSpeedBoost", () => {
            const player = this.players[socket.id];
            if (!player || !player.alive) return;

            player.speedMultiplier = 2.0;

            // Andere Spieler benachrichtigen
            this.io.to(this.id).emit("playerGotSpeedBoost", { playerId: socket.id });

            // Nach 5 Sekunden zurücksetzen
            setTimeout(() => {
                player.speedMultiplier = 1.0;
                this.io.to(this.id).emit("playerSpeedBoostExpired", { playerId: socket.id });
            }, 5000);
        });

        socket.on("playerGotShield", () => {
            const player = this.players[socket.id];
            if (player) {
                player.shieldActive = true;
                this.io.to(this.id).emit("playerGotShield", { playerId: socket.id });

                setTimeout(() => {
                    player.shieldActive = false;
                    this.io.to(this.id).emit("playerShieldExpired", { playerId: socket.id });
                }, 5000);
            }
        });




    }

    removePlayer(socketId) {
        delete this.players[socketId];
        // Wenn leer, Cleanup starten
        if (Object.keys(this.players).length === 0) {
            this.scheduleCleanup();
        }
    }

    scheduleCleanup() {
        console.log(`Leere Lobby ${this.id}, wird in 60 Sekunden gelöscht.`);
        this.cleanupTimeout = setTimeout(() => {
            console.log(`Lobby ${this.id} gelöscht.`);
            this.lobbyManager.deleteLobby(this.id);
        }, 60000); // 60 Sekunden
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
    startCountdown(durationInSeconds = 25) {
        if (this.countdownInterval) return;

        this.currentCountdown = durationInSeconds;
        this.io.to(this.id).emit("lobbyStatusUpdate", {
            players: this.playerCount(),
            maxPlayers: this.maxPlayers,
            countdown: this.currentCountdown
        });

        this.countdownInterval = setInterval(() => {
            this.currentCountdown--;
            this.io.to(this.id).emit("lobbyStatusUpdate", {
                players: this.playerCount(),
                maxPlayers: this.maxPlayers,
                countdown: this.currentCountdown
            });

            if (this.currentCountdown <= 0) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                this.currentCountdown = null;
                this.io.to(this.id).emit("gameStart", { lobbyId: this.id });
            }
        }, 1000);
    }

    broadcastLobbyStatus() {
        this.io.to(this.id).emit("lobbyStatusUpdate", {
            players: this.playerCount(),
            maxPlayers: this.maxPlayers,
            countdown: this.currentCountdown // kann auch `null` sein
        });
    }

}

module.exports = GameLobby;
