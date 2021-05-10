const WsServerController = require("../controllers/WsServerController");
const wsServerController = new WsServerController();

function onlineUserAPI(req, res, next) {
    const connectedUsers = wsServerController.wsServerStatus.onlineUsers;
    console.log(connectedUsers);
    return res.json(connectedUsers);

}

module.exports = {
    onlineUserAPI
}