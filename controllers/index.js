const COIN_OPTIONS = require("../utils/CCY");
const AUTH = require("./auth");

const getOptions = (_, res) => {
  return res.json({ data: COIN_OPTIONS });
};

const COINS = {
  getOptions
};

module.exports = {
  AUTH,
  COINS
};
