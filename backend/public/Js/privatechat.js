const socket = io("/privatechat");
const chatArea = document.getElementById("private-chatarea");

let connectedUsers = {};
window.onload = () => {
  fetch("http://localhost:5000/api/getconnectedusers")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      connectedUsers = data;
      let html = "";
      for (user in connectedUsers) {
        html +=
          "<li><button onclick='onUserSelected(this.innerHTML);'>" +
          user +
          "</button></li>";
        document.getElementById("private-users").innerHTML += html;
      }
    });
};

const { username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

var private_username = username;
var receiver = "";

socket.on("connect", () => {
  console.log("socket connect");
  socket.emit("user_connected", private_username);
});

var count = -1;
socket.on("user_connected", (private_username) => {
  var html = "";
  // count++;
  // for (var i = 0; i <= count; i++) {
  html +=
    "<li><button onclick='onUserSelected(this.innerHTML);'>" +
    private_username +
    "</button></li>";
  document.getElementById("private-users").innerHTML += html;
  //}
});

function onUserSelected(private_username) {
  receiver = private_username;
}

function sendMessage() {
  var message = document.getElementById("private-messageInput").value;

  socket.emit("send_message", {
    sender: private_username,
    receiver: receiver,
    message: message,
  });
  return false;
}

socket.on("new_message", (data) => {
  console.log(data);
  chatArea.append(data.message);
});
