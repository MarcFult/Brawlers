const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const players = {};

io.on("connection", (socket) => {
  console.log(`🔌 Spieler verbunden: ${socket.id}`);

  socket.on("playerJoined", (data) => {
    players[socket.id] = { id: socket.id, ...data };
    socket.broadcast.emit("newPlayer", players[socket.id]);
    socket.emit("currentPlayers", players);
  });

  socket.on("playerMoved", (data) => {
    if (players[socket.id]) {
      players[socket.id] = { ...players[socket.id], ...data };
      socket.broadcast.emit("playerMoved", { id: socket.id, ...data });
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    socket.broadcast.emit("playerDisconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("✅ Socket.io Server läuft auf Port 3001");
});
