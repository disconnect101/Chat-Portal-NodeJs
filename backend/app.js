const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const socketioStreamer = require("socket.io-stream");
const cors = require("cors");

const WsServerController = require("./controllers/WsServerController");
const webSocketControllers = require("./controllers/WebSocketControllers");
const { onlineUserAPI } = require("./api/onlineusersapi");
const { activeRoomsAPI } = require("./api/activeroomapi");

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
app.get("/api/getconnectedusers", (req, res, next) => {
  return onlineUserAPI(req, res, wsServerController);
  next();
});

app.get("/api/getactiverooms", (req, res, next) => {
  return activeRoomsAPI(req, res, io);
  next();
});

module.exports = { server };
