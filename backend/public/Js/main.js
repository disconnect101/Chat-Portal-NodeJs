const socket = io();

const submit = document.getElementById("submit");
const messageInput = document.getElementById("messageInput");
const textarea = document.getElementById("textarea");
const body = document.getElementsByTagName("body")[0];
const statusDiv = document.getElementById("status");

socket.on("connect", () => {
  console.log("Socket connected...");
});

socket.on("message", (data) => {
  console.log(data);
  textarea.append(data.message + "\n");
});

submit.addEventListener("click", (e) => {
  e.preventDefault();
  const message = messageInput.value;
  if (socket.connected)
    socket.emit("message", { message: message }, (response) => {
      statusDiv.innerHTML = `Message is being send...`;
      setTimeout(function () {
        if (response.status === "Ok")
          statusDiv.innerHTML = "Message sent successfully.";
        else statusDiv.innerHTML = "Message send Failed.";

        textarea.append(message + "\n");
      }, 1000);
    });
});
