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

  // find transaction
  let entry = await Transaction.findOne({ txn_id: data.txn_id });

  // if exists and confirmed and accounted do nothing
  if (entry && entry.status >= 100 && entry.accounted) return;

  // if doesn't exist create new one
  if (!entry) {
    entry = new Transaction({ ...data, user_id: userId });
    await entry.save();
  }

  // update entry status when confiremed
  if (entry && entry.status < 100 && data.status >= 100) {
    entry.status = data.status;
    await entry.save();
  }

  // If confirmed but not accounted => increment user balance
  if (entry && entry.status >= 100 && !entry.accounted) {
    await User.updateOne(
      { _id: userId, "funds.coinName": data.currency },
      {
        $inc: {
          "funds.$.balance": data.amount,
          "funds.$.totalDepositsAmount": data.amount
        }
      }
    );
    entry.accounted = true;
    await entry.save();
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
