const COIN_OPTIONS = require("../utils/CCY");
const AUTH = require("./auth");
const BETS = require("./bet");
const USER = require("./user");
const TRANSACTIONS = require("./transactions");
const User = require("../models/user");
const Transaction = require("../models/transaction");
const Message = require("../models/message");
const axios = require("axios");
const config = require("../config");
const CCY = require("../utils/CCY");
const online = require("../ws/online");
const sampleSize = require("lodash.samplesize");
const getIO = require("../ws").getIO;
const TYPES = require("../ws/types");
const Big = require("big.js");

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

const makeRain = async (req, res) => {
  try {
    const { user } = req;
    const { comment, amount, coin } = req.body;

    // Verify amount is > min.withdrawal but more than balance
    const minWithdrawal = CCY[coin].MIN_WITHDRAWAL;
    const balance = req.user.getFund(coin).balance;

    if (
      Number(amount) < Number(minWithdrawal) ||
      Number(amount) > Number(balance)
    )
      throw new Error("Could not make rain");

    // Randomly select 10 or max online beneficiaries
    const count = Math.min(online.getOnlineUsersCount() - 1, 10);
    const beneficiariesSockets = sampleSize(
      [...online.getOnlineUsers()]
        .map(ben => ben[1])
        .filter(sock => String(sock.user._id) !== String(user._id)),
      count
    );

    // create new transaction for decreasing user balance
    await new Transaction({
      user_id: user._id,
      ipn_type: "rain_out",
      amount,
      currency: coin
    }).save();

    // and transaction for inc balance of each benef
    const amountForBeneficiary = Number(
      Big(amount)
        .div(count === 0 ? 1 : count)
        .toFixed(8)
    );
    const promises = beneficiariesSockets.map(beneficiarySocket =>
      new Transaction({
        user_id: beneficiarySocket.user._id,
        ipn_type: "rain_in",
        amount: amountForBeneficiary,
        currency: coin
      }).save()
    );

    await Promise.all(promises);

    // decr user balance
    const newUser = await User.findOneAndUpdate(
      { _id: user._id, "funds.coinName": coin },
      {
        $inc: {
          "funds.$.balance": -amount,
          "funds.$.totalWithdrawalsAmount": amount
        }
      },
      { new: true }
    );

    // increment benef balances
    const dbPromises = beneficiariesSockets.map(beneficiarySocket =>
      User.findOneAndUpdate(
        { _id: beneficiarySocket.user._id, "funds.coinName": coin },
        {
          $inc: {
            "funds.$.balance": amountForBeneficiary,
            "funds.$.totalDepositsAmount": amountForBeneficiary
          }
        },
        { new: true }
      )
    );

    await Promise.all(dbPromises);

    // save rain data to massages
    const author = {
      userName: user.userName,
      _id: user._id
    };

    const message = await new Message({
      createTime: new Date(),
      author,
      type: "rain",
      data: {
        winners: beneficiariesSockets.map(b => ({
          userName: b.user.userName,
          id: b.user._id
        })),
        amount,
        coin,
        emmiter: { userName: user.userName, id: user.id },
        comment
      }
    }).save();

    // send back updated user and emit rain event to all online
    const IO = getIO();
    IO.emit(TYPES.RAIN, message);

    return res.json({ data: newUser.getPublicFields() });
  } catch (e) {
    console.log("Error requesting faucet ", e);

    return res.status(502).json({
      error: true,
      message: "Could not cause rain"
    });
  }
};

const COINS = {
  getOptions
};

const FAUCET = {
  deposit
};

const RAIN = {
  makeRain
};

module.exports = {
  AUTH,
  USER,
  BETS,
  COINS,
  FAUCET,
  TRANSACTIONS,
  LANDING,
  RAIN
};
