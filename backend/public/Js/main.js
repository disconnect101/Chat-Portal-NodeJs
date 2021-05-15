const chatForm = document.getElementById("chat-form");
const submit = document.getElementById("submit1");
const messageInput = document.getElementById("messageInput");
const chatarea = document.getElementById("chatarea");
const roomName = document.getElementById("room-name");

//var roomname;

//get username and room from URL
const { username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io("/groupchat");

document.getElementById("createroom").addEventListener('keypress', function (e) {

  if (e.key === 'Enter') {
    console.log(e.currentTarget.value);
    onRoomSelected(e.currentTarget.value);
  }
})

let activeRoomname = {};
window.onload = () => {
  fetch("http://localhost:5000/api/getactiverooms")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      activeRoomname = data;
      let html = "";
      document.getElementById("roomnamelist").innerHTML = html;
      for (room in activeRoomname) {
        html =
          "<li><button onclick='onRoomSelected(this.innerHTML);'>" +
          room +
          "</button></li>";
        document.getElementById("roomnamelist").innerHTML += html;
      }
    });
};

function onRoomSelected(roomname) {
  //join chat room
  socket.emit("joinRoom", { username, roomname });

  //get room
  socket.on("roomUsers", ({ roomname }) => {
    roomName.append("Room Name: " + roomname + "\n");
  });
}



//message from server
socket.on("message", (message) => {
  console.log(message);
  // const div = document.createElement('div');
  // div.innerHTML = `<p> message </p>`;
  chatarea.append(message.username + " said:\n" + message.text + "\n\n");

  //scroll down
  chatarea.scrollTop = chatarea.scrollHeight;
});

//message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //get message text
  const message = messageInput.value;

  //emit message to server
  socket.emit("chatMessage", message);

  //clear input
  messageInput.value = "";
  messageInput.focus();
});

//output msg to dom
// function outputMessage(message) {
//     const div = document.createElement('div');
//     div.innerHTML = `<p> ${message} </p>`;
//     chatarea.append(div);
// }
