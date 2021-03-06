const fs = require("fs");
var path = require("path");

////
////
////
class GeneralWebSocketController {
  constructor(socket, wsServerController, namespaceObject) {
    this.namespaceObject = namespaceObject;
    this.socket = socket;
    this.wsServerController = wsServerController;
    this.username = socket.username;

    this.newUserConnected(this.socket, this.namespaceObject);
    //this.activeRoom();
  }

  newUserConnected = (socket, namespaceObject) => {
    this.wsServerController.wsServerStatus.onlineUsers[
      this.username
    ] = this.socket.id;

    this.socket.broadcast.emit("newUserConnected", {
      username: this.username,
      socketid: this.socket.id,
    });
  };

  getUsername = () => this.username;

  // activeRoom = () => {
  //   return new Set(this.wsServerController.wsServerStatus.activeRooms).length;
  // }
}

////
////
////
class GroupChatWebSocketController extends GeneralWebSocketController {
  constructor(socket, wsServerController, namespaceObject) {
    super(socket, wsServerController, namespaceObject);

    this.socket.on("joinRoom", this.joinRoomHandler);
    this.socket.on("chatMessage", this.chatMessageHandler);
    this.socket.on("disconnect", this.disconnectHandler);
    //this.socket.on("createRoom", this.createRoomHandler)
    this.botName = "MyChat Bot";
  }

  // createRoomHandler = (roomname) => {
  //   console.log("inside createroomhandler");
  //   this.namespaceObject.adapter.on("create-room", (roomname) => {
  //     console.log("room ${roomname} was created");
  //   });
  // }

  joinRoomHandler = ({ username, roomname }) => {
    //console.log("here");
    const user = this.userJoin(this.socket.id, username, roomname);

    // if (this.wsServerController.wsServerStatus.activeRooms.includes(roomname) === false) {
    //   this.wsServerController.wsServerStatus.activeRooms.push(roomname);
    // }

    this.socket.join(user.roomname);

    this.namespaceObject.adapter.on("create-room", (roomname) => {
      console.log("room ${roomname} was created");
    });

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
      // var rooms = Object.keys(io.sockets.adapter.sids[id]);
      // var count = 0;
      // for (var room in rooms) {
      //   count++;
      //   if (count === 1) {
      //     continue;
      //   }
      //   this.wsServerController.wsServerStatus.activeRooms.remove(room);
      // }

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

////
////
////
class FileTranferWebSocketController extends GeneralWebSocketController {
  constructor(socket, wsServerController, namespaceObject) {
    super(socket, wsServerController, namespaceObject);

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

////
////
////
class PrivateChatWebSocketController extends GeneralWebSocketController {
  constructor(socket, wsServerController, namespaceObject) {
    super(socket, wsServerController, namespaceObject);
    this.socket.on("send_message", this.sendMessageHandler);
    this.socket.on("disconnect", this.disconnectHandler);
  }

  sendMessageHandler = (data) => {
    const socketId = this.wsServerController.wsServerStatus.onlineUsers[
      data.receiver
    ];
    this.namespaceObject.to(socketId).emit("new_message", data);
  };

  disconnectHandler = () => {
    const username = Object.keys(
      this.wsServerController.wsServerStatus.onlineUsers
    ).find(
      (key) =>
        this.wsServerController.wsServerStatus.onlineUsers[key] ===
        this.socket.id
    );
    delete this.wsServerController.wsServerStatus.onlineUsers[username];
    //this.namespaceObject.emit("user_disconnect", private_username);
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
