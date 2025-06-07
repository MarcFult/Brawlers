const GameLobby = require("./GameLobby");

class LobbyManager {
    constructor(io) {
        this.lobbies = new Map();
        this.io = io;
    }

    createLobby(name, maxPlayers, creatorSocket) {
        const id = this._generateLobbyId();
        const newLobby = new GameLobby(id, name, maxPlayers, this.io);
        this.lobbies.set(id, newLobby);
        newLobby.addPlayer(creatorSocket);
        console.log(this.lobbies.keys())
        return id;
    }

    joinLobby(id, socket) {
        const lobby = this.lobbies.get(id);
        if (!lobby) return { success: false, message: "Lobby existiert nicht" };
        if (!lobby.hasSpace()) return { success: false, message: "Lobby ist voll" };

        lobby.addPlayer(socket);
        return { success: true };
    }

    leaveAll(socketId) {
        for (const [id, lobby] of this.lobbies.entries()) {
            lobby.removePlayer(socketId);
            if (lobby.isEmpty()) this.lobbies.delete(id);
        }
    }

    getLobbies() {
        return Array.from(this.lobbies.values()).map((lobby) => ({
            id: lobby.id,
            name: lobby.name,
            maxPlayers: lobby.maxPlayers,
            currentPlayers: lobby.playerCount(),
        }));
    }
    _generateLobbyId() {
        return Math.random().toString(36).substr(2, 6);
    }
    getLobbyById(id) {
        return this.lobbies.get(id);
    }

}

module.exports = LobbyManager;
