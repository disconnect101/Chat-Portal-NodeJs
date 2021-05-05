const fs = require("fs");
var path = require("path");

class DefaultWebSocketController {
  constructor(socket, wsServerController) {
    this.socket = socket;
    this.wsServerController = wsServerController;
    this.socket.on("joinRoom", this.joinRoomHandler);
    this.socket.on("chatMessage", this.chatMessageHandler);
    this.socket.on("discoonect", this.disconnectHandler);
    this.botName = "MyChat Bot";
  }

  joinRoomHandler = ({ username, roomname }) => {
    const user = this.userJoin(this.socket.id, username, roomname);
    this.socket.join(user.roomname);
    //welcome current user
    this.socket.emit(
      "message",
      this.formatMessage(this.botName, "Welcome to myChat!")
    );
    //Broadcast when a user connects
    this.socket.broadcast
      .to(user.roomname)
      .emit(
        "message",
        this.formatMessage(this.botName, `${user.username} has joined the chat`)
      );
    //send room info
    this.wsServerController.wsServer.to(user.roomname).emit("roomUsers", {
      roomname: user.roomname,
    });
  };

  chatMessageHandler = (message) => {
    const user = this.getCurrentUser(this.socket.id);
    this.wsServerController.wsServer
      .to(user.roomname)
      .emit("message", this.formatMessage(user.username, message));
  };

  disconnectHandler = () => {
    const user = this.userLeave(this.socket.id);
    if (user) {
      this.wsServerController.wsServer
        .to(user.roomname)
        .emit(
          "message",
          this.formatMessage(this.botName, `${user.username} has left the chat`)
        );
    }
  };

  //Join user to chat
  userJoin = (id, username, roomname) => {
    const user = { id, username, roomname };
    this.wsServerController.wsServerStatus.users.push(user);
    return user;
  };

  //get current user
  getCurrentUser = (id) => {
    return this.wsServerController.wsServerStatus.users.find(
      (user) => user.id === id
    );
  };

  //user leaves chat
  userLeave = (id) => {
    const index = this.wsServerController.wsServerStatus.users.findIndex(
      (user) => user.id === id
    );

    if (index !== -1) {
      return this.wsServerController.wsServerStatus.users.splice(index, 1)[0];
    }
  };

  formatMessage = (username, text) => {
    return {
      username,
      text,
    };
  };
}

class FileTranferWebSocketController {
  constructor(socket, wsServerController) {
    this.socket = socket;
    this.wsServerController = wsServerController;
    this.wsServerController
      .wsStreamer(this.socket)
      .on("fileData", this.fileReceiver);
    this.botName = "MyChat Bot";
  }

  fileReceiver = (stream, data) => {
    console.log("data variable", data);
    var filename = path.basename(data.name);

    let size = 0;
    /*stream.on("data", (chunk) => {
      size += chunk.length;
      console.log(Math.ceil((size / data.size) * 100));
    });*/
    stream.on("end", () => {
      console.log("end");
      this.socket.emit("tranfer complete", {});
    });
    stream.pipe(fs.createWriteStream(filename));
  };
}

module.exports = { DefaultWebSocketController, FileTranferWebSocketController };
