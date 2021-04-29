const path = require("path");
const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);

const io = socketio(server);

io.on("connection", (socket) => {
  console.log("Socket connected to: ", socket.conn.remoteAddress);
  socket.on("message", (data, callback) => {
    console.log(data);
    socket.broadcast.emit("message", data);
    callback({
      status: "Ok",
    });
  });
});

app.use("/", express.static(path.join(__dirname, "public")));

module.exports = { server };
