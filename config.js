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
      "b23fe328f272a1d12ab7ea1404b18bb5017adad19b92e6f8228cadf0228ac2e9",
    SECRET:
      process.env.COINPAYMENTS_SECRET ||
      "cF23ecbed8239DA0CBe84066946b248e619b8f2df49dB2c51341Cc49BD607679",
    IPN_SECRET: process.env.COINPAYMENTS_IPN_SECRET || "saldklsadkalsakdl",
    IPT_URL_BASE:
      process.env.COINPAYMENTS_IPT_URL_BASE || "https://properdice.com/ipn"
  },
  CCY,
  FRONT_END: {
    URL: process.env.FRONT_END_URL || "http://localhost:3000",
    LANDING_URL: process.env.LANDING_URL || "http://localhost:8001"
  },
  DICE: {
    MARGIN: process.env.DICE_MARGIN || 0.01,
    FAUCET_MIN_DELAY: process.env.FAUCET_MIN_DELAY || 300000 // milliseconds
  }
};
