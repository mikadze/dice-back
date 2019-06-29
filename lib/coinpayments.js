const Coinpayments = require("coinpayments");
const config = require("../config").COINPAYMENTS;
const qs = require("querystring");
const crypto = require("crypto");
const Transaction = require("../models/transaction");
const User = require("../models/user");

const options = {
  key: config.KEY,
  secret: config.SECRET
};

const client = new Coinpayments(options);

const generateDepositAddress = async ({ currency, id }) => {
  const { address } = await client.getCallbackAddress({
    currency: currency,
    ipn_url: `${config.IPT_URL_BASE}/${id}`
  });

  if (!address) throw new Error("Could not generate new deposit address");

  return address;
};

const onDepositTx = async ({ data, userId, hmac }) => {
  if (!verifyDeposit(hmac, config.IPN_SECRET, data))
    throw new Error("Could not verify IPN info");

  // Create transaction entry if doesn't exist
  // If exists check if status confirmed
  const entry = await Transaction.findOne({ txn_id: data.txn_id });
  if (entry && entry.status >= 100) return;

  if (entry && entry.status < 100 && data.status >= 100) {
    entry.status = data.status;
    await entry.save();
  }

  if (!entry) {
    const newEntry = new Transaction({ ...data, user_id: userId });
    await newEntry.save();
  }

  // If confirmed => increment user balance
  if (data.status >= 100 && (!entry || entry.status < 100)) {
    await User.updateOne(
      { _id: userId, "funds.coinName": data.currency },
      {
        $inc: {
          "funds.$.balance": data.amount,
          "funds.$.totalDepositsAmount": data.amount
        }
      }
    );
  }

  // TODO: emit event to user if online
};

const verifyDeposit = (hmac, ipnSecret, payload) => {
  const paramString = qs.stringify(payload).replace(/%20/g, "+");
  const calcHmac = crypto
    .createHmac("sha512", ipnSecret)
    .update(paramString)
    .digest("hex");

  if (hmac !== calcHmac) return false;
  return true;
};

const createWithdrawal = ({ amount, currency, address }) =>
  client.createWithdrawal({ amount, currency, address, auto_confirm: 0 });

module.exports = {
  generateDepositAddress,
  onDepositTx,
  createWithdrawal
};
