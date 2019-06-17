const jwt = require("jsonwebtoken");
const secret = require("../config").JWT_SECRET;
const User = require("../models/user");

const auth = async (req, res, next) => {
  if (!req.headers["authorization"]) return next();
  try {
    jwt.verify(req.headers["authorization"], secret, async (err, decoded) => {
      if (!err && decoded) {
        const user = await User.findById(decoded.id).exec();
        if (user) {
          req.user = user;
        }
      }
      return next();
    });
  } catch (err) {
    return next();
  }
};

module.exports = auth;
