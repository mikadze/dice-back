const jwt = require("jsonwebtoken");
const secret = require("../config").JWT_SECRET;
const User = require("../models/user");

const verifyToken = token => {
  return Promise.resolve().then(() =>
    jwt.verify(token, secret, async (err, decoded) => {
      if (!err && decoded) {
        const user = await User.findById(decoded.id).exec();
        if (user) {
          return Promise.resolve(user);
        }
        return Promise.reject();
      }
    })
  );
};

module.exports = {
  verifyToken
};
