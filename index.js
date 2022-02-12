const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const cryptoRandomString = require("crypto-random-string");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 3000;
const io = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
    origin: true,
  },
});

app.get("/broadcast/new", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connect", (socket) => {
  console.log("Socket joined at ID", socket.id);

  socket.on("joinCast", (e) => {
    socket.room = e.id;
    console.log(`${socket.id} is joining cast ${e.id}`);
    socket.join(e.id);
  });

  socket.on("serveCast", () => {
    console.log("Serving");
    const id = cryptoRandomString({ length: 8 });
    io.to(socket.id).emit("castId", {
      id,
    });
    socket.join(id);
  });

  socket.on("updateCast", (e) => {
    console.log("Updating cast");
    io.to(socket.room).emit("updateCast", e);
  });
});

server.listen(port, () => {
  console.log("listening on *:3000");
});
