const Joi = require("@hapi/joi");
const authRoute = require("./authRoute.schema");
const transactionRoute = require("./transactionRoute.schema");
const rollEvent = require("./rollEvent.schema");

const faucetRoute = Joi.object().keys({
  selectedCoin: Joi.string()
    .required()
    .min(3)
    .max(5),
  captcha: Joi.string()
    .required()
    .min(0)
    .max(400)
});

module.exports = {
  authRoute,
  rollEvent,
  faucetRoute,
  transactionRoute
};
