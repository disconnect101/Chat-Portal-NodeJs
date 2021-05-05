const chatForm = document.getElementById("chat-form");
const submit = document.getElementById("submit1");
const messageInput = document.getElementById("messageInput");
const chatarea = document.getElementById("chatarea");
const roomName = document.getElementById("room-name");

//get username and room from URL
const { username, roomname } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io("/groupchat");

//join chat room

socket.emit("joinRoom", { username, roomname });

//get room
socket.on("roomUsers", ({ roomname }) => {
  roomName.append("Room Name: " + roomname + "\n");
});

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
