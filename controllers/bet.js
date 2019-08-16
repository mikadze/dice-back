const User = require("../models/user");
const Bet = require("../models/bet");

const getInfo = async (req, res) => {
  try {
    const { id } = req.body;

    let bet = await Bet.findById(id);
    const user = await User.findById(bet.userid);

    if (!user || !bet) throw new Error("Invalid request");

    if (user.serverSalt === bet.serverSalt) {
      return res.json({
        error: null,
        data: bet.getPublicFields()
      });
    }

    bet = {
      serverSalt: bet.serverSalt,
      ...bet.getPublicFields()
    };

    return res.json({
      error: null,
      data: bet
    });
  } catch (e) {
    console.log("getting info error ", e);
    return res.status(502).json();
  }
};

module.exports = {
  getInfo
};
