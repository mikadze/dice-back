const User = require("../models/user");
const uuid = require("uuid");
const crypto = require("crypto");

const randomize = async (req, res) => {
  try {
    const { clientSalt } = req.body;

    const serverSalt = uuid.v4();
    const hashedServerSalt = crypto
      .createHash("sha512")
      .update(serverSalt)
      .digest("hex");

    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { clientSalt, serverSalt, hashedServerSalt, nonce: 0 },
      { new: true }
    );

    return res.json({
      error: null,
      data: user.getPublicFields()
    });
  } catch (e) {
    console.log("error randomizing seed ", e);
    return res.status(502).json();
  }
};

module.exports = {
  randomize
};
