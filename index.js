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
    socket.data.room = e;
    console.log(`${socket.id} is joining cast ${e}`);
    socket.join(e);
  });

  socket.on("serveCast", () => {
    const id = cryptoRandomString({ length: 8 });
    socket.data.room = id;
    console.log("Serving new cast at ID", id);
    io.to(socket.id).emit("castId", {
      id,
    });
    socket.join(id);
  });

  socket.on("updateCast", (e) => {
    io.to(socket.data.room).emit("updateCast", {
      content: e.content,
      cursorPosition: e.cursorPosition,
    });
  });

  socket.on("killCast", (id) => {
    io.in(socket.room).disconnectSockets();
  });
});

server.listen(PORT, () => {
  console.log("listening on port", PORT);
});
