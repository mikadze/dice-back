const CCY = require("./utils/CCY");

module.exports = {
  DB: {
    URL: process.env.MONGO_DB_URL || "mongodb://localhost:27017/casino",
    AUTO_INDEX: true
  },
  CAPTCHA_SECRET:
    process.env.CAPTCHA_SECRET || "6LdLrqoUAAAAALMyMA-IZKfzUVdqjqtzczxltj7S",
  JWT_SECRET: process.env.JWT_SECRET || "daskljfsa[pwqeqwp!@lsda",
  CCY,
  FRONT_END: {
    URL: process.env.FRONT_END_URL || "http://localhost:3000"
  },
  DICE: {
    MARGIN: process.env.DICE_MARGIN || 0.01,
    FAUCET_MIN_DELAY: process.env.FAUCET_MIN_DELAY || 300000 // milliseconds
  }
};
