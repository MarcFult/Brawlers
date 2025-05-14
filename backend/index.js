const { Server } = require("socket.io");
const http = require("http");
const LobbyManager = require("./LobbyManager");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
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

    if (!targetLobby) {
      // Falls keine Lobby existiertn erstellen wir eine
      targetLobby = lobbyManager.createLobby("Default Lobby", 4, socket);
    }

    const result = lobbyManager.joinLobby(targetLobby, socket);

    if (result.success) {
      socket.emit("lobbyJoined", {
        success: true,
        lobbyId: targetLobby,
        skin: skin
      });
    } else {
      callback({ success: false, message: result.message });
    }
  });


  socket.on("getLobbies", (callback) => {
    callback(lobbyManager.getLobbies());
  });

  socket.on("disconnect", () => {
    lobbyManager.leaveAll(socket.id);
    io.emit("lobbyListUpdate", lobbyManager.getLobbies());
  });
});

server.listen(3001, () => {
  console.log("Socket.io Server läuft auf Port 3001");
});
