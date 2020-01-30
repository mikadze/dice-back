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

// USER
router.post(
  "/user/randomize",
  protected,
  validate(schemas.userRoute.randomize),
  controllers.USER.randomize
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

// BETS
router.post(
  "/bet/info",
  protected,
  validate(schemas.betRoute.getInfo),
  controllers.BETS.getInfo
);

// OTHER
router.post(
  "/faucet",
  protected,
  validate(schemas.faucetRoute),
  controllers.FAUCET.deposit
);

router.post(
  "/rain",
  protected,
  validate(schemas.rainRoute),
  controllers.RAIN.makeRain
);

router.get("/coins", controllers.COINS.getOptions);

router.post("/landing/subscribe", controllers.LANDING.subscribe);

module.exports = router;
