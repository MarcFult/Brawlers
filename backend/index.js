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
    players[socket.id] = { id: socket.id, ...data, alive: true , kills : 0};

    console.log(`${socket.id} joined on map: ${data.map}`);

    socket.emit("currentPlayers", players);
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

      // Wer hat ihn getötet?
      const lastShooterId = player.lastHitBy;
      if (lastShooterId && players[lastShooterId]) {
        players[lastShooterId].kills += 1;

        // Dem Schützen seine neuen Kills mitteilen
        io.to(lastShooterId).emit("updateKills", {
          kills: players[lastShooterId].kills
        });
      }

      socket.emit("youAreDead");
      socket.broadcast.emit("playerDied", { id: socket.id });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Spieler getrennt: ${socket.id}`);
    delete players[socket.id];
    socket.broadcast.emit("playerDisconnected", socket.id);
  });

  socket.on("playerHit", ({ shooterId, targetId }) => {
    //kill counter stuff
    const target = players[targetId];
    if (target) {
      target.lastHitBy = shooterId; // Letzter Schütze merken
    }
    io.emit("playerWasHit", { targetId });

    io.to(shooterId).emit("hitConfirmed", { targetId });
    io.emit("playerWasHit", { targetId });
    io.to(targetId).emit("playerDamaged", { damage: 25 });
  });

});

server.listen(3001, () => {
  console.log("Socket.io Server läuft auf Port 3001");
});
