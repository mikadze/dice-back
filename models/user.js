const uuid = require("uuid");
const crypto = require("crypto");
const config = require("../config");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    userName: { type: String, index: { unique: true } },
    password: String,
    email: String,
    clientSalt: String,
    serverSalt: String,
    hashedServerSalt: String,
    nonce: Number,
    createTime: { type: Date },
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isPassSet: { type: Boolean, default: false },
    isEmailSet: { type: Boolean, default: false },
    funds: [
      {
        coinName: String,
        totalDepositsAmount: mongoose.Schema.Types.Decimal,
        depositAddress: String,
        withdrawAddress: String,
        totalWithdrawalsAmount: mongoose.Schema.Types.Decimal,
        totalNetProfit: mongoose.Schema.Types.Decimal,
        balance: mongoose.Schema.Types.Decimal,
        totalWagered: mongoose.Schema.Types.Decimal,
        lastFaucetTime: Date
      }
    ]
  },
  { autoIndex: config.DB.AUTO_INDEX }
);

class UserClass {
  // Document methods
  getFund(coinName) {
    const { funds } = this.toObject();
    for (let i in funds) {
      let fund = funds[i];
      if (fund.coinName === coinName) return fund;
    }

    return null;
  }

  getBalance(coinName) {
    let fund = this.getFund(coinName);
    if (fund) return fund.balance;

    return 0;
  }

  addProfit(coinName, profit) {
    let fund = this.getFund(coinName);
    if (fund) {
      fund.profit += profit;
      fund.balance += balance;
      return fund;
    }
  }

  getPublicFields() {
    const {
      password,
      serverSalt,
      isAdmin,
      isBlocked,
      ...rest
    } = this.toObject();
    return rest;
  }

  // Static methods
  static async CreateNewUser(userName, pass) {
    const password = crypto
      .createHash("sha512")
      .update(pass)
      .digest("hex");

    const serverSalt = uuid.v4();

    const user = new userModel({
      userName,
      password,
      serverSalt,
      clientSalt: uuid.v4(),
      hashedServerSalt: crypto
        .createHash("sha512")
        .update(serverSalt)
        .digest("hex"),
      nonce: 0,
      createTime: new Date(),
      funds: [
        {
          coinName: config.CCY.BTC.NAME,
          depositAddress: "",
          totalDepositsAmount: 0,
          withdrawAddress: "",
          totalWithdrawalsAmount: 0,
          totalNetProfit: 0,
          totalFaucets: config.CCY.BTC.MIN_FAUCET,
          balance: config.CCY.BTC.MIN_FAUCET,
          totalWagered: 0
        }
      ]
    });

    let newUser = await user.save();
    newUser = newUser.getPublicFields();

    return newUser;
  }

  static async GetUserById(userId, fields) {
    return await userModel.findOne({ _id: userId }, fields);
  }

  static async getFunds(userId) {
    const u = await userModel.findOne({ _id: userId }, "funds");
    return u.funds;
  }

  static async loginUser(userName, pass) {
    const password = crypto
      .createHash("sha512")
      .update(pass)
      .digest("hex");
    return await userModel.findOne({ userName, password });
  }
}

userSchema.loadClass(UserClass);

userSchema.set("toObject", {
  getters: true,
  transform: (_, ret) => {
    if (ret.funds) {
      ret.funds = ret.funds.map(fund => {
        const newFund = {
          ...fund,
          totalDepositsAmount: Number(fund.totalDepositsAmount.toString()),
          totalWithdrawalsAmount: Number(
            fund.totalWithdrawalsAmount.toString()
          ),
          totalNetProfit: Number(fund.totalNetProfit.toString()),
          balance: Number(fund.balance.toString()),
          totalWagered: Number(fund.totalWagered.toString())
        };

        return newFund;
      });
    }
    delete ret.__v;
    return ret;
  }
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
