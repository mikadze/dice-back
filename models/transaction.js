const config = require("../config");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema(
  {
    address: String,
    amount: Number,
    confirms: Number,
    currency: String,
    fee: Number,
    feei: Number,
    fiat_amount: Number,
    fiat_amounti: Number,
    fiat_coin: String,
    fiat_fee: Number,
    fiat_feei: Number,
    ipn_id: String,
    ipn_mode: String,
    ipn_type: String,
    ipn_version: String,
    merchant: String,
    status: Number,
    status_text: String,
    txn_id: String,
    user_id: String
  },
  { autoIndex: config.DB.AUTO_INDEX, timestamps: true }
);

class BetClass {
  getPublicFields() {
    const {
      confirms,
      fee,
      feei,
      fiat_fee,
      fiat_feei,
      ipn_id,
      ipn_mode,
      ipn_type,
      ipn_version,
      merchant,
      status,
      status_text,
      txn_id,
      ...rest
    } = this.toObject();
    return rest;
  }
}

TransactionSchema.loadClass(BetClass);

const transactionModel = mongoose.model("transaction", TransactionSchema);

module.exports = transactionModel;
