const Joi = require("@hapi/joi");
const authRoute = require("./authRoute.schema");
const betRoute = require("./betRoute.schema");
const userRoute = require("./userRoute.schema");
const transactionRoute = require("./transactionRoute.schema");
const rollEvent = require("./rollEvent.schema");
const CCY = require("../utils/CCY");

const faucetRoute = Joi.object().keys({
  selectedCoin: Joi.string().valid(...Object.keys(CCY)),
  captcha: Joi.string()
    .required()
    .min(0)
    .max(4000)
});

module.exports = {
  authRoute,
  userRoute,
  betRoute,
  rollEvent,
  faucetRoute,
  transactionRoute
};
