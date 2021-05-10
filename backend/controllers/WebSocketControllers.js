const fs = require("fs");
var path = require("path");

/*class GeneralWebSocketController {
  constructor(socket, wsServerController, namespaceObject) {
    this.namespaceObject = namespaceObject;
    this.socket = socket;
    this.wsServerController = wsServerController;

    this.socket.on("newUserConnected", this.newUserConnected);
  }

  newUserConnected = () => {

  }
}*/

class GroupChatWebSocketController {
  constructor(socket, wsServerController, namespaceObject) {
    //console.log("hello grp chat")
    this.namespaceObject = namespaceObject;
    this.socket = socket;
    this.wsServerController = wsServerController;
    this.socket.on("joinRoom", this.joinRoomHandler);
    this.socket.on("chatMessage", this.chatMessageHandler);
    this.socket.on("disconnect", this.disconnectHandler);
    this.botName = "MyChat Bot";
  }

  joinRoomHandler = ({ username, roomname }) => {
    //console.log("here");
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
    this.namespaceObject.to(user.roomname).emit("roomUsers", {
      roomname: user.roomname,
    });
  };

  chatMessageHandler = (message) => {
    const user = this.getCurrentUser(this.socket.id);
    this.namespaceObject
      .to(user.roomname)
      .emit("message", this.formatMessage(user.username, message));
  };

  disconnectHandler = () => {
    const user = this.userLeave(this.socket.id);
    if (user) {
      this.namespaceObject
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
  constructor(socket, wsServerController, namespaceObject) {
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
    stream.on("end", () => {
      console.log("end");
      this.socket.emit("tranfer complete", {});
    });
    stream.pipe(fs.createWriteStream(filename));
  };
}

class PrivateChatWebSocketController {
  constructor(socket, wsServerController, namespaceObject) {
    this.namespaceObject = namespaceObject;
    this.socket = socket;
    this.wsServerController = wsServerController;
    //console.log("User connected", this.socket.id);
    this.socket.on("user_connected", this.userConnectionHandler);
    this.socket.on("send_message", this.sendMessageHandler);
  }

  userConnectionHandler = (private_username) => {
    //attach incoming listerner for new user
    const socket_id = this.socket.id;
    //const data = { private_username, socket_id };
    this.wsServerController.wsServerStatus.onlineUsers[
      private_username
    ] = this.socket.id;
    this.namespaceObject.emit("user_connected", private_username);
  };

  sendMessageHandler = (data) => {
    const socketId = this.wsServerController.wsServerStatus.onlineUsers[
      data.receiver
    ];
    console.log(socketId);
    this.namespaceObject.to(socketId).emit("new_message", data);
  };
}
/*
class PrivateChatWebSocketController {
  constructor(socket, wsServerController, namespaceObject) {
    //console.log("hello grp chat")
    this.namespaceObject = namespaceObject;
    this.socket = socket;
    this.wsServerController = wsServerController;
    this.socket.on("joinChat", this.joinChatHandler);
    this.socket.on("chatMessage", this.chatMessageHandler);
    this.socket.on("disconnect", this.disconnectHandler);
    this.botName = "MyChat Bot";
  }

  joinChatHandler = ({ username }) => {
    //console.log("here");
    const user = this.userJoin(this.socket.id, username);
    //this.socket.join(user.roomname);
    //welcome current user
    this.socket.emit(
      "message",
      this.formatMessage(this.botName, "Welcome to myChat!")
    );

    if (user !== -1) {
      this.update_username(user);
    }

    // //Broadcast when a user connects
    // this.socket.broadcast
    //   .to(user.roomname)
    //   .emit(
    //     "message",
    //     this.formatMessage(this.botName, `${user.username} has joined the chat`)
    //   );
    // //send room info
    // this.namespaceObject.to(user.roomname).emit("roomUsers", {
    //   roomname: user.roomname,
    // });
  };

  chatMessageHandler = (data) => {
    const socketId = this.wsServerController.wsServerStatus.onlineUsers[
      data.receiver
    ];
    this.namespaceObject
      .to(socketId)
      .emit("message", this.formatMessage(data.receiver, message));
  };

  disconnectHandler = () => {
    const user = this.userLeave(this.socket.id);
    // if (user) {
    //   this.namespaceObject
    //     .to(user.roomname)
    //     .emit(
    //       "message",
    //       this.formatMessage(this.botName, `${user.username} has left the chat`)
    //     );
    // }
  };

  //Join user to chat
  userJoin = (id, username) => {
    if (
      this.wsServerController.wsServerStatus.namesUsed.indexOf(username) !== -1
    ) {
      alert("That name is already taken! Please choose another one");
      return undefined;
    }

    var ind =
      this.wsServerController.wsServerStatus.namesUsed.push(username) - 1;
    this.wsServerController.wsServerStatus.clients[ind] = this.socket;
    this.wsServerController.wsServerStatus.onlineUsers[
      this.socket.id
    ] = username;
    return 1;
  };

  update_username = () => {
    this.namespaceObject.emit(
      "user_connected",
      this.wsServerController.wsServerStatus.namesUsed
    );
  };

  //get current user
  // getCurrentUser = (id) => {
  //   return this.wsServerController.wsServerStatus.users.find(
  //     (user) => user.id === id
  //   );
  // };

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
*/
module.exports = {
  GroupChatWebSocketController,
  FileTranferWebSocketController,
  PrivateChatWebSocketController,
};
