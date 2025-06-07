const { Server } = require("socket.io");
const http = require("http");
const LobbyManager = require("./LobbyManager");
const express = require("express");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
}); // http://10.0.40.186:5173
const lobbyManager = new LobbyManager(io);


io.on("connection", (socket) => {
  console.log("Spieler verbunden:", socket.id);

  socket.on("createLobby", ({ name, maxPlayers }, callback) => {
    const lobbyId = lobbyManager.createLobby(name, maxPlayers, socket);
    callback({ success: true, lobbyId });
    io.emit("lobbyListUpdate", lobbyManager.getLobbies());
  });

  socket.on("joinLobby", ({ lobbyId, skin }, callback) => {
    console.log("Client tritt Lobby bei:", { lobbyId, skin });
    let targetLobby = null;
    for (const [id, lobby] of lobbyManager.lobbies.entries()) {
      if (id === lobbyId || lobbyId === "default") {
        targetLobby = id;
        break;
      }
    }

    // Falls Lobby nicht gefunden, erstelle eine neue Default-Lobby
    if (!targetLobby) {
      targetLobby = lobbyManager.createLobby("Default Lobby", 4, socket);
    }

    callback({ success: true }); // <<< Wichtig

    const result = lobbyManager.joinLobby(targetLobby, socket);

    if (result.success) {
      // Socket in Raum (Lobby) joinen
      socket.join(targetLobby);

      // Spieler über erfolgreichen Beitritt informieren
      socket.emit("lobbyJoined", {
        success: true,
        lobbyId: targetLobby,
        skin: skin
      });

      // andere in der Lobby informieren
      io.to(targetLobby).emit("playerJoined", {
        id: socket.id,
        skin: skin
      });

      // Sofort Status an Lobby senden
      const lobby = lobbyManager.getLobbyById(targetLobby);
      if (lobby) {
        lobby.broadcastLobbyStatus();
      }

    } else {
      // Fehler zurücksenden
      callback({ success: false, message: result.message });
    }
  });

});

setInterval(() => {
  for (const [id, lobby] of lobbyManager.lobbies.entries()) {
    lobby.broadcastLobbyStatus();
  }
}, 2000);


server.listen(3001, () => {
  console.log("Socket.io Server läuft auf Port 3001");
});
