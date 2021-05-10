const WsServerController = require("../controllers/WsServerController");

function onlineUserAPI(req, res, wsServerController) {
  const connectedUsers = wsServerController.wsServerStatus.onlineUsers;
  console.log(connectedUsers);
  return res.json(connectedUsers);
}

module.exports = {
  onlineUserAPI,
};
