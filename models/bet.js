const config = require("../config");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BetSchema = new Schema(
  {
    userid: String,
    userName: String,
    clientSalt: String,
    serverSalt: String,
    nonce: Number,
    amount: Number,
    betNumber: Number,
    rollNumber: Number,
    betTime: Date,
    coin: String,
    payout: Number,
    profit: Number
  },
  { autoIndex: config.DB.AUTO_INDEX }
);

class BetClass {
  getPublicFields() {
    const {
      userid,
      serverSalt,
      ...rest
    } = this.toObject();
    return rest;
  }
}

BetSchema.loadClass(BetClass);

const betModel = mongoose.model("bet", BetSchema);

module.exports = betModel;
