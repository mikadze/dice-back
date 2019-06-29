const User = require("../models/user");
const cp = require("../lib/coinpayments");

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

module.exports = {
  depositAddress,
  newDeposit
};
