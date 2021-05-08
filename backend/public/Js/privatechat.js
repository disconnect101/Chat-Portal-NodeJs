const socket = io("/privatechat");

const { username } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

var private_username = username;
var receiver = "";

socket.emit("user_connected", private_username);

var count = -1;
socket.on("user_connected", (private_username) => {
    var html = "";
    // count++;
    // for (var i = 0; i <= count; i++) {
    html += "<li><button onclick='onUserSelected(this.innerHTML);'>" + private_username + "</button></li>";
    document.getElementById("private-users").innerHTML += html;
    //}
});

function onUserSelected(private_username) {
    receiver = private_username;
}

function sendMessage() {
    var message = document.getElementById("private-messageInput");

    socket.emit("send_message", {
        sender: private_username,
        receiver: receiver,
        message: message
    });
    return false;
}

socket.on("new_message", (data) => {
    console.log(data);
});



