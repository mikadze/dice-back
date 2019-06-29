const User = require("../models/user");
const cp = require("../lib/coinpayments");
const CCY = require("../utils/CCY");
const Transaction = require("../models/transaction");

const depositAddress = async (req, res) => {
  try {
    const { coin } = req.body;
    const fund = req.user.getFund(coin);

    if (fund.depositAddress) res.json({ data: req.user.getPublicFields() });

    const address = await cp.generateDepositAddress({
      currency: coin,
      id: req.user._id
    });

    const newUser = await User.findOneAndUpdate(
      { _id: req.user._id, "funds.coinName": coin },
      {
        $set: {
          "funds.$.depositAddress": address
        }
      },
      { new: true }
    );

    return res.json({ data: newUser.getPublicFields() });
  } catch (e) {
    console.log("Error generating new deposit address ", e);

    return res.status(502).json({
      error: true,
      message: "Error generating new deposit address"
    });
  }
};

const newDeposit = async (req, res) => {
  try {
    cp.onDepositTx({
      data: req.body,
      userId: req.params.userId,
      hmac: req.get("HMAC")
    });

    return res.json();
  } catch (e) {
    console.log("Error processing new deposit");
  }
};

const withdraw = async (req, res) => {
  try {
    const { address, amount, coin } = req.body;

    // verify amount more then min withdrawal but less/equal balance
    const minWithdrawal = CCY[coin].MIN_WITHDRAWAL;
    const balance = req.user.getFund(coin).balance;

    if (
      Number(amount) < Number(minWithdrawal) ||
      Number(amount) > Number(balance)
    )
      throw new Error("Could not withdraw");

    // create withdrawal
    const { id, ...rest } = await cp.createWithdrawal({
      amount: 1,
      currency: coin,
      address
    });

    // save transaction
    await new Transaction({
      txn_id: id,
      user_id: req.user._id,
      ipn_type: "withdrawal",
      ...rest
    }).save();

    // decr balance
    const newUser = await User.findOneAndUpdate(
      { _id: req.user._id, "funds.coinName": coin },
      {
        $inc: {
          "funds.$.balance": -amount,
          "funds.$.totalWithdrawalsAmount": amount
        }
      },
      { new: true }
    );

    return res.json({ data: newUser.getPublicFields() });
  } catch (e) {
    console.log("Error processing withdrawal", e);
    return res.status(502).json({
      error: true,
      message: "Error processing withdrawal"
    });
  }
};

module.exports = {
  depositAddress,
  newDeposit,
  withdraw
};
