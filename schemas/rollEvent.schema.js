const Joi = require("@hapi/joi");
const CCY = require('../utils/CCY')

const betAmount = Joi.number()
  .min(0)
  .required();

const payout = Joi.number()
  .required()
  .min(1.01)
  .max(9900);

const betNumber = Joi.number()
  .required()
  .when("isOver", {
    is: true,
    then: Joi.number()
      .min(1.99)
      .max(97.99),
    otherwise: Joi.number()
      .min(2)
      .max(98)
  });

const coin = Joi.string().valid(...Object.keys(CCY));

const bet = Joi.object().keys({
  betAmount,
  payout,
  betNumber,
  isOver: Joi.boolean().required(),
  coin
});

module.exports = {
  bet
};
