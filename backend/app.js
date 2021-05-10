const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const socketioStreamer = require("socket.io-stream");
const cors = require("cors");

const WsServerController = require("./controllers/WsServerController");
const webSocketControllers = require("./controllers/WebSocketControllers");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Registering middleware
app.use(cors());

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
app.use("/api/getconnectedusers", (req, res, next) => {
  const connectedUsers = wsServerController.wsServerStatus.onlineUsers;
  console.log(connectedUsers);
  res.json(connectedUsers);
});

module.exports = { server };
