const users = [];

//Join user to chat
function userJoin(id, username, roomname) {
  const user = { id, username, roomname };
  users.push(user);
  return user;
}

//get current user
function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

//user leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
};
