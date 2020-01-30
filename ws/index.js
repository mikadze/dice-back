const TYPES = require("./types");
const HANDLERS = require("./handlers");
const verifyToken = require("../utils").verifyToken;

let IO;

const protected = (func, socket) => {
  return function() {
    if (!socket.user) return;
    func.apply(this, arguments);
  };
};

const init = io => {
  IO = io;

  // MIDDLEWARE
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.query.token;
      const user = await verifyToken(token);
      if (user) socket.user = user;
      return next();
    } catch (err) {
      return next();
    }
  });

  io.on(TYPES.CONNECT, socket => {
    console.log("a user connected ", socket.user && socket.user._id);

    HANDLERS.ON_CONNECT(socket, io);

    socket.on(TYPES.LOGIN, HANDLERS.ON_LOGIN(socket, io));

    socket.on(
      TYPES.CHAT.MESSAGE,
      protected(HANDLERS.CHAT.ON_MESSAGE(socket), socket)
    );

    socket.on(
      TYPES.DICE.ROLL,
      protected(HANDLERS.DICE.ON_ROLL(socket), socket)
    );

    socket.on(TYPES.DISCONNECT, HANDLERS.ON_DISCONNECT(socket, io));
  });
};

module.exports = {
  init,
  getIO: () => IO
};
