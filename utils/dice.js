const Big = require("big.js");
const config = require("../config");
const crypto = require("crypto");

module.exports.calculateBetNum = (payout, isOver) => {
  const rollUnder = Big(100)
    .div(payout)
    .mul(1 - config.DICE.MARGIN)
    .toFixed(2);
  const rollOver = Big(99.99)
    .minus(rollUnder)
    .toFixed(2);

  return isOver ? Number(rollOver) : Number(rollUnder);
};

module.exports.calculateProfit = ({
  rollNumber,
  betAmount,
  betNumber,
  payout,
  isOver
}) => {
  const didWin = isOver
    ? Big(rollNumber).gt(betNumber)
    : Big(rollNumber).lt(betNumber);

  const profit = didWin
    ? Big(payout)
        .mul(betAmount)
        .minus(betAmount)
    : Big(-1).mul(betAmount);

  return Number(profit);
};

module.exports.generateRollNum = ({ clientSeed, serverSeed, nonce }) => {
  const hash = crypto
    .createHmac("sha512", serverSeed)
    .update(`${clientSeed}-${nonce}`)
    .digest("hex");

  let index = 0;

  let lucky = parseInt(hash.substring(index * 5, index * 5 + 5), 16);

  // keep grabbing characters from the hash while greater than
  while (lucky >= Math.pow(10, 6)) {
    index++;
    lucky = parseInt(hash.substring(index * 5, index * 5 + 5), 16);

    // if we reach the end of the hash, just default to highest number
    if (index * 5 + 5 > 128) {
      lucky = 9999;
      break;
    }
  }

  lucky %= Math.pow(10, 4);
  lucky /= Math.pow(10, 2);

  return lucky;
};
