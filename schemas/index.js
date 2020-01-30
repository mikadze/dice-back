const Joi = require("@hapi/joi");
const authRoute = require("./authRoute.schema");
const betRoute = require("./betRoute.schema");
const userRoute = require("./userRoute.schema");
const transactionRoute = require("./transactionRoute.schema");
const rollEvent = require("./rollEvent.schema");
const CCY = require("../utils/CCY");

const coin = Joi.string().valid(...Object.keys(CCY));

const comment = Joi.string()
  .max(400)
  .allow("");

const amount = Joi.number()
  .min(0)
  .required();

const faucetRoute = Joi.object().keys({
  selectedCoin: Joi.string().valid(...Object.keys(CCY)),
  captcha: Joi.string()
    .required()
    .min(0)
    .max(4000)
});

const rainRoute = Joi.object().keys({
  comment,
  amount,
  coin
});

module.exports = {
  authRoute,
  userRoute,
  betRoute,
  rollEvent,
  faucetRoute,
  transactionRoute,
  rainRoute
};
