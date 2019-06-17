const Joi = require("@hapi/joi");

const validate = schema => (req, res, next) => {
  const { error, value } = Joi.validate(req.body, schema, {
    stripUnknown: true
  });

  if (error) {
    return res.status(422).json({
      error: true,
      message: "Invalid request data"
    });
  }

  req.body = value;
  return next();
};

module.exports = validate;
