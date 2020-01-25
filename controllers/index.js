const COIN_OPTIONS = require("../utils/CCY");
const AUTH = require("./auth");
const BETS = require("./bet");
const USER = require("./user");
const TRANSACTIONS = require("./transactions");
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
      fund.balance > Number(1e-8) ||
      new Date().getTime() - new Date(fund.lastFaucetTime).getTime() <
        config.DICE.FAUCET_MIN_DELAY
    )
      throw new Error("Failed Criteria");

    // verify captcha
    const { success } = await axios
      .post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${config.CAPTCHA_SECRET}&response=${captcha}`
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

const LANDING = {
  subscribe: async (req, res) => {
    try {
      const { data } = req.body;
      const API_KEY = "dd7f6df1c993c96aa89fbb08f1c1d0f6-us4";
      const LIST_ID = "8f66fafdd6";

      await axios(
        `https://us4.api.mailchimp.com/3.0/lists/${LIST_ID}/members`,
        {
          method: "POST",
          data,
          headers: {
            Authorization: `randomUser ${API_KEY}`
          }
        }
      );
      return res.json({
        error: false
      });
    } catch (e) {
      return res.status(502).json({
        error: true
      });
    }
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
  USER,
  BETS,
  COINS,
  FAUCET,
  TRANSACTIONS,
  LANDING
};
