const WebSocketControllers = require("./WebSocketControllers");

class WsServerController {
  constructor(wsServer, wsStreamer) {
    this.wsServer = wsServer;
    this.wsStreamer = wsStreamer;
    this.wsServerStatus = { users: [] };
    this.wsServerConfig = { routes: [], namespaceObjects: [] };
  }

  route(path, WebSocketController) {
    this.wsServerConfig.routes.push({ path, WebSocketController });
  }

  start = () => {
    ////custom websocket controllers register for their respective paths
    this.wsServerConfig.routes.forEach(({ path, WebSocketController }) => {
      this.registerWebSocketController(path, WebSocketController);
    });
    //default websocket controller register

    this.wsServerConfig.routes.forEach(({ path, WebSocketController }) => {
      console.log(path, WebSocketController);
    });
    console.log("WebSocket Server Started...");
  };

  registerWebSocketController = (path, WebSocketController) => {
    const namespaceObject = this.wsServer.of(path);
    this.wsServerConfig.namespaceObjects.push({ path, namespaceObject });
    namespaceObject.on("connection", (socket) => {
      console.log("connection received for path:" + path);
      const webSocketController = new WebSocketController(
        socket,
        this,
        namespaceObject
      );
    });
  };
}

module.exports = WsServerController;
