const WebSocketController = require("./WebSocketController");

class WsServerController {
  constructor(wsServer) {
    this.wsServerStatus = {
      users: [],
    };
    this.wsServer = wsServer;
  }

  start = () => {
    this.wsServer.on("connection", this.connectionHandler);
    console.log("WebSocket Server Started...");
  };

  connectionHandler = (socket) => {
    //console.log(WebSocket);
    const webSocketController = new WebSocketController(socket, this);
  };
}

module.exports = WsServerController;
