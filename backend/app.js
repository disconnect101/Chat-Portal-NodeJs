const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const socketioStreamer = require("socket.io-stream");

const WsServerController = require("./controllers/WsServerController");
const webSocketControllers = require("./controllers/WebSocketControllers");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const wsServerController = new WsServerController(io, socketioStreamer);
wsServerController.route(
  "/groupchat",
  webSocketControllers.GroupChatWebSocketController
);
wsServerController.route(
  "/filetransfer",
  webSocketControllers.FileTranferWebSocketController
);

wsServerController.route(
  "/privatechat",
  webSocketControllers.PrivateChatWebSocketController
);

wsServerController.start();

//set static folder
app.use("/", express.static(path.join(__dirname, "public")));

module.exports = { server };
