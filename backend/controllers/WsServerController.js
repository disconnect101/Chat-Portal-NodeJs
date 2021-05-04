const WebSocketControllers = require("./WebSocketControllers");

class WsServerController {
  constructor(wsServer, wsStreamer) {
    this.wsServer = wsServer;
    this.wsStreamer = wsStreamer;
    this.wsServerStatus = { users: [] };
    this.wsServerConfig = { routes: [] };
  }

  route(path, WebSocketController) {
    this.wsServerConfig.routes.push({ path, WebSocketController });
  }

  start = () => {
    ////custom websocket controllers register for their respective paths
    this.wsServerConfig.routes.forEach(({ path, WebSocketController }) => {
      this.registerWebSocketController(path, WebSocketController);
    });
    ////default websocket controller register
    this.registerWebSocketController(
      "/",
      WebSocketControllers.DefaultWebSocketController
    );

    this.wsServerConfig.routes.forEach(({ path, WebSocketController }) => {
      console.log(path, WebSocketController);
    });
    console.log("WebSocket Server Started...");
  };

  registerWebSocketController = (path, WebSocketController) => {
    this.wsServer.of(path).on("connection", (socket) => {
      console.log("connection received for path:" + path);
      const webSocketController = new WebSocketController(socket, this);
    });
  };
}

module.exports = WsServerController;
