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

// TRANSACTIONS
router.post(
  "/deposit/address",
  protected,
  validate(schemas.transactionRoute.depositAddress),
  controllers.TRANSACTIONS.depositAddress
);

router.post(
  "/withdraw",
  protected,
  validate(schemas.transactionRoute.withdraw),
  controllers.TRANSACTIONS.withdraw
);

// OTHER
router.post(
  "/faucet",
  protected,
  validate(schemas.faucetRoute),
  controllers.FAUCET.deposit
);

router.get("/coins", controllers.COINS.getOptions);

module.exports = router;
