const Joi = require("@hapi/joi");

const userName = Joi.string()
  .alphanum()
  .min(4)
  .max(30)
  .required();
const password = Joi.string()
  .min(6)
  .max(60)

const register = Joi.object().keys({
  userName,
  password
});

module.exports = {
  register
}
