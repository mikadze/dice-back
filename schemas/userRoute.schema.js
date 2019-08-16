const Joi = require("@hapi/joi");

const clientSalt = Joi.string()
  .min(1)
  .max(60);

const randomize = Joi.object().keys({
  clientSalt
});

module.exports = {
  randomize
};
