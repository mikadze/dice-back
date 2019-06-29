const CCY = require("./utils/CCY");

module.exports = {
  DB: {
    URL: process.env.MONGO_DB_URL || "mongodb://localhost:27017/casino",
    AUTO_INDEX: true
  },
  CAPTCHA_SECRET:
    process.env.CAPTCHA_SECRET || "6LdLrqoUAAAAALMyMA-IZKfzUVdqjqtzczxltj7S",
  JWT_SECRET: process.env.JWT_SECRET || "daskljfsa[pwqeqwp!@lsda",
  COINPAYMENTS: {
    KEY:
      process.env.COINPAYMENTS_KEY ||
      "8f4ed68cbe6730b83d9ba90ba761ef374ae2c3a9a5f659093468b8c682e0cbb5",
    SECRET:
      process.env.COINPAYMENTS_SECRET ||
      "8D43c3F65608e2ff6855c60Ac74DD79c21a24472959f4bAD857E7997cf99f50B",
    IPN_SECRET: process.env.COINPAYMENTS_IPN_SECRET || "saldklsadkalsakdl",
    IPT_URL_BASE:
      process.env.COINPAYMENTS_IPT_URL_BASE || "https://001bec72.ngrok.io/ipn"
  },
  CCY,
  FRONT_END: {
    URL: process.env.FRONT_END_URL || "http://localhost:3000"
  },
  DICE: {
    MARGIN: process.env.DICE_MARGIN || 0.01,
    FAUCET_MIN_DELAY: process.env.FAUCET_MIN_DELAY || 300000 // milliseconds
  }
};
