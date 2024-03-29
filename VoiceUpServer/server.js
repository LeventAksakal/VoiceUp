const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const { generateToken, verifyToken } = require("./util/cookieHandler");
const { v4: uuidv4 } = require("uuid");
const cookie = require("cookie");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cookieParser());

app.use(async (req, res, next) => {
  if (req.path.startsWith("/assets/")) {
    return next();
  }
  const existingToken = req.cookies.userId;
  if (!existingToken) {
    const jwtToken = generateToken();
    res.cookie("userId", jwtToken, {
      httpOnly: true,
    });
  } else {
    try {
      await verifyToken(existingToken);
    } catch (error) {
      res.clearCookie("userId");
      const newJwtToken = generateToken();
      res.cookie("userId", newJwtToken, {
        httpOnly: true,
      });
    }
  }
  next();
});
app.use(express.static(path.join(__dirname, "../VoiceUpClient/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../VoiceUpClient/dist/index.html"));
});

io.use((socket, next) => {
  if (socket.handshake.headers && socket.handshake.headers.cookie) {
    const cookies = cookie.parse(socket.handshake.headers.cookie);
    if (cookies.userId) {
      socket.userId = cookies.userId;
      next();
    } else {
      next(new Error("Authentication error"));
    }
  } else {
    next(new Error("Authentication error"));
  }
});

let userCount = 0;
const queue = [];
const rooms = {};

io.on("connection", (socket) => {
  userCount++;
  socket.emit("user-count", userCount);
  socket.on("video-request", () => {
    if (queue.find((s) => s === socket)) return;
    if (queue.length > 0) {
      const room = uuidv4();
      const peer = queue.pop();
      peer.join(room);
      socket.join(room);
      rooms[room] = [peer, socket];
      peer.emit("video-answer", room);
      socket.emit("video-offer", room);
    } else {
      queue.push(socket);
    }
  });
  socket.on("offer", (offer, room) => {
    socket.to(room).emit("offer", offer);
  });
  socket.on("answer", (answer, room) => {
    socket.to(room).emit("answer", answer);
  });
  socket.on("candidate", (candidate, room) => {
    socket.to(room).emit("candidate", candidate);
  });
  socket.on("leave", (room) => {
    let i = queue.indexOf(socket);
    if (i !== -1) {
      queue.splice(i, 1);
    }
    socket.to(room).emit("skip");
    io.to(socket.id).emit("refresh-rtc");
    if (rooms[room]) {
      rooms[room].forEach((s) => {
        s.leave(room);
      });
      delete rooms[room];
    }
  });
  socket.on("skip", (room) => {
    io.to(room).emit("skip");
    if (rooms[room]) {
      rooms[room].forEach((s) => {
        s.leave(room);
      });
      delete rooms[room];
    }
  });
  socket.on("disconnect", () => {
    userCount--;
    let i = queue.indexOf(socket);
    if (i !== -1) {
      queue.splice(i, 1);
    }
  });
});

// setInterval(() => {
//   console.log("queue", queue);
//   console.log("rooms", rooms);
// }, 5000);

const port = 3000;
server.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});
