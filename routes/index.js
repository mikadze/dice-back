const express = require("express");
const router = express.Router();
const controllers = require("../controllers");
const { protected, adminProtected } = require("../middleware/protected");
const validate = require("../middleware/validate");
const schemas = require("../schemas");

// AUTH
router.post(
  "/auth/register",
  validate(schemas.authRoute.register),
  controllers.AUTH.register
);
router.get("/auth/user", protected, controllers.AUTH.getUser);
router.post(
  "/auth/password",
  protected,
  validate(schemas.authRoute.setPass),
  controllers.AUTH.setPassword
);
router.post(
  "/auth/login",
  validate(schemas.authRoute.login),
  controllers.AUTH.login
);

router.get("/coins", controllers.COINS.getOptions);

module.exports = router;
