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
  console.log(`Spieler verbunden: ${socket.id}`);

  socket.on("playerJoined", (data) => {
    players[socket.id] = { id: socket.id, ...data, alive: true };

    // Sende vorhandene Spieler an den neuen
    socket.emit("currentPlayers", players);

    // Teile allen anderen mit, dass ein neuer Spieler da ist
    socket.broadcast.emit("newPlayer", players[socket.id]);
  });

  socket.on("playerMoved", (data) => {
    const player = players[socket.id];
    if (!player || !player.alive) return;

    players[socket.id] = { ...player, ...data };
    socket.broadcast.emit("playerMoved", { id: socket.id, ...data });
  });

  socket.on("playerShot", (data) => {
    const player = players[socket.id];
    if (!player || !player.alive) return;

    socket.broadcast.emit("playerShot", {
      id: socket.id,
      x: data.x,
      y: data.y,
      velocity: data.velocity
    });
  });

  socket.on("playerDead", () => {
    const player = players[socket.id];
    if (player) {
      player.alive = false;

      // Nur an den gestorbenen Spieler selbst:
      socket.emit("youAreDead");

      // Alle anderen über den Tod informieren
      socket.broadcast.emit("playerDied", { id: socket.id });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Spieler getrennt: ${socket.id}`);
    delete players[socket.id];
    socket.broadcast.emit("playerDisconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Socket.io Server läuft auf Port 3001");
});
