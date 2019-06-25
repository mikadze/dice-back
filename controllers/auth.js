const uuid = require("uuid");
const User = require("../models/user");
const config = require("../config");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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

const setPassword = async (req, res) => {
  const { password, _id } = req.body;
  try {
    const hash = crypto
      .createHash("sha512")
      .update(password)
      .digest("hex");

    await User.update({ _id }, { password: hash, isPassSet: true }).exec();
    return res.json();
  } catch (e) {
    console.log("error changing password ", e);

    return res.status(502).json({
      error: true,
      message: "Error changing password"
    });
  }
};

const login = async (req, res) => {
  try {
    const { userName, password } = req.body;

    let user = await User.loginUser(userName, password);
    if (!user) throw new Error("Invalid username password");

    user = user.getPublicFields();
    const token = await generateJWT(user);
    user.token = token;

    return res.json({
      error: null,
      data: user
    });
  } catch (e) {
    console.log("login error ", e);
    return res.status(401).json();
  }
};

module.exports = {
  register,
  getUser,
  setPassword,
  login
};
