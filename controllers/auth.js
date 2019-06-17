const uuid = require("uuid");
const User = require("../models/user");
const config = require("../config");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { userName } = req.body;
    const pass = uuid.v4();

    let user = await User.CreateNewUser(userName, pass);
    const token = await generateJWT(user);
    user.token = token;

    return res.json({
      data: user
    });
  } catch (e) {
    console.log("user registration error ", e);

    return res.status(502).json({
      error: true,
      message: "Error registering user"
    });
  }
};

const getUser = async (req, res) => {
  if (req.user)
    return res.json({
      error: null,
      data: req.user.getPublicFields()
    });
  return res.status(401).json();
};

const generateJWT = async user =>
  new Promise((resolve, reject) => {
    jwt.sign({ id: user._id }, config.JWT_SECRET, (err, token) => {
      if (err) return reject(err);
      return resolve(token);
    });
  });

module.exports = {
  register,
  getUser
};
