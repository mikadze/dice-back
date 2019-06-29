const Joi = require("@hapi/joi");
const CCY = require("../utils/CCY");

const coin = Joi.string().valid(...Object.keys(CCY));

const address = Joi.string()
  .required()
  .min(1)
  .max(400);

const amount = Joi.number()
  .min(0)
  .required();

const depositAddress = Joi.object().keys({
  coin
});

const withdraw = Joi.object().keys({
  address,
  amount,
  coin
});

module.exports = {
  depositAddress,
  withdraw
};
