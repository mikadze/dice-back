const Joi = require("@hapi/joi");

const coin = Joi.string()
  .min(3)
  .max(6)
  .required();

const depositAddress = Joi.object().keys({
  coin
});

module.exports = {
  depositAddress
};
