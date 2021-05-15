const WebSocketControllers = require("./WebSocketControllers");

class WsServerController {
  constructor(wsServer, wsStreamer) {
    this.wsServer = wsServer;
    this.wsStreamer = wsStreamer;
    this.wsServerStatus = {
      users: [],
      onlineUsers: {},
      activeRooms: [],
    };
    this.wsServerConfig = { routes: [], namespaceObjects: [] };
  }

  route(path, WebSocketController) {
    this.wsServerConfig.routes.push({ path, WebSocketController });
  }

  ////
  //// SERVER START FUNCTION
  ////
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

  ////
  ////  ROUTE REGISTERING FUNCTION
  ////
  registerWebSocketController = (path, WebSocketController) => {
    const namespaceObject = this.wsServer.of(path);
    this.wsServerConfig.namespaceObjects.push({ path, namespaceObject });

    namespaceObject.use(this.getUsername);

    namespaceObject.on("connection", (socket) => {
      console.log("connection received for path:" + path);
      const webSocketController = new WebSocketController(
        socket,
        this,
        namespaceObject
      );
    });
  };

  ////
  //// MIDDLEWARES
  ////
  getUsername = (socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("invalid username"));
    }
    socket.username = username;
    next();
  };
}

module.exports = WsServerController;
