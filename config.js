const CCY = require("./utils/CCY");

module.exports = {
  DB: {
    URL: process.env.MONGO_DB_URL || "mongodb://localhost:27017/casino",
    AUTO_INDEX: true
  },
  JWT_SECRET: process.env.JWT_SECRET || "daskljfsa[pwqeqwp!@lsda",
  CCY,
  FRONT_END: {
    URL: process.env.FRONT_END_URL || "http://localhost:3000"
  },
  DICE: {
    MARGIN: process.env.DICE_MARGIN || 0.01
  }
};
