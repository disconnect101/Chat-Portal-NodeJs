const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const WsServerController = require("./controllers/WsServerController");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const wsServerController = new WsServerController(io);
wsServerController.start();

//set static folder
app.use("/", express.static(path.join(__dirname, "public")));

server.listen(3000, () => {
  console.log("Listening to port 3000...");
});
