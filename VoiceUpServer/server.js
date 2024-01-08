const http = require("http");
const socketIO = require("socket.io");
const express = require("express");
const app = express();
const server = http.createServer(app);
const io = new socketIO.Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
