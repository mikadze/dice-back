const Joi = require("@hapi/joi");

const id = Joi.string()
  .min(6)
  .max(60);

const getInfo = Joi.object().keys({
  id
});

module.exports = {
  getInfo
};
