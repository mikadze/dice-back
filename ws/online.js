const online = new Map();

const addOnline = (id, socket) => {
  online.set(id, socket);
};

const removeOnline = id => {
  online.delete(id);
};

const getOnlineSocket = id => online.get(id);

const getOnlineUsersCount = () => online.size;

const getOnlineUsers = () => online.entries();

module.exports = {
  addOnline,
  removeOnline,
  getOnlineSocket,
  getOnlineUsers,
  getOnlineUsersCount
};
