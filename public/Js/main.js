const socket = io();

const submit = document.getElementById("submit");
const messageInput = document.getElementById("messageInput");
const textarea = document.getElementById("textarea");

socket.on("connect", () => {
  console.log("Socket connected...");
});

socket.on("message", (data) => {
  textarea.append(data + "\n");
});

submit.addEventListener("click", (e) => {
  e.preventDefault();
  const message = messageInput.value;
  if (socket.connected) socket.emit("message", message);
});
