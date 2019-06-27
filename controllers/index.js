const COIN_OPTIONS = require("../utils/CCY");
const AUTH = require("./auth");
const User = require("../models/user");
const axios = require("axios");
const config = require("../config");
const CCY = require("../utils/CCY");

const getOptions = (_, res) => {
  return res.json({ data: COIN_OPTIONS });
};

const deposit = async (req, res) => {
  try {
    const { captcha, selectedCoin } = req.body;

    // check if eligible
    const fund = req.user.getFund(selectedCoin);
    if (
      fund.balance > 0 ||
      new Date().getTime() - new Date(fund.lastFaucetTime).getTime() <
        config.DICE.FAUCET_MIN_DELAY
    )
      throw new Error("Failed Criteria");

    // verify captcha
    const { success } = await axios
      .post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${
          config.CAPTCHA_SECRET
        }&response=${captcha}`
      )
      .then(res => res.data);

    if (!success) throw new Error("Captcha error");
    if (!CCY[selectedCoin]) throw new Error("Unknown currency");

    let newUser = await User.findOneAndUpdate(
      { _id: req.user._id, "funds.coinName": selectedCoin },
      {
        $inc: {
          "funds.$.balance": CCY[selectedCoin].MIN_FAUCET
        },
        $set: {
          "funds.$.lastFaucetTime": new Date()
        }
      },
      { new: true }
    );

    return res.json({
      data: newUser.getPublicFields()
    });
  } catch (e) {
    console.log("Error requesting faucet ", e);

    return res.status(502).json({
      error: true,
      message: "Error requesting faucet"
    });
  }
};

const COINS = {
  getOptions
};

const FAUCET = {
  deposit
};

module.exports = {
  AUTH,
  COINS,
  FAUCET
};
