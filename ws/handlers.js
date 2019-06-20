const Message = require("../models/message");
const User = require("../models/user");
const Bet = require("../models/bet");
const verifyToken = require("../utils").verifyToken;
const Joi = require("@hapi/joi");
const betSchema = require("../schemas/rollEvent.schema").bet;
const TYPES = require("./types");
const Big = require("big.js");
const dice = require("../utils/dice");
const throttle = require("lodash.throttle");

const broadcastThrottled = throttle(
  (socket, bet, user) =>
    socket.volatile.broadcast.emit(TYPES.DICE.ROLL_RESULT, {
      bet,
      user
    }),
  1000
);

const ON_CONNECT = async socket => {
  try {
    const messagesP = Message.find()
      .sort({ createTime: -1 })
      .limit(50)
      .exec();

    const betsP = Bet.find()
      .sort({ betTime: -1 })
      .limit(20)
      .exec();

    let userBetsP = null;
    if (socket.user) {
      userBetsP = Bet.find({ userid: socket.user._id })
        .sort({ betTime: -1 })
        .limit(20)
        .exec();
    }

    let [messages, bets, userBets] = await Promise.all([
      messagesP,
      betsP,
      userBetsP
    ]);

    bets = bets.map(bet => bet.getPublicFields());
    userBets = userBets.map(bet => bet.getPublicFields());

    messages.reverse();

    socket.emit(TYPES.CHAT.INITIAL_MESSAGES, messages);
    socket.emit(TYPES.BETS.INITIAL_BETS, bets);
    userBets && socket.emit(TYPES.BETS.INITIAL_USER_BETS, userBets);
  } catch (e) {
    console.log("error HANDLER:ON_COONECT ", e);
  }
};

const ON_LOGIN = socket => async ({ token }) => {
  try {
    const user = await verifyToken(token);
    if (user) socket.user = user;
  } catch (e) {
    console.log("error HANDLER:LOGIN ", e);
  }
};

const CHAT = {
  ON_MESSAGE: socket => async message => {
    try {
      const author = {
        userName: message.author.userName,
        _id: message.author._id
      };
      const newMessage = new Message({
        createTime: new Date(),
        message: message.text,
        author
      });
      const savedMessage = await newMessage.save();
      socket.broadcast.emit(TYPES.CHAT.MESSAGE, savedMessage);
    } catch (e) {
      console.log("error ON_MESSAGE", e);
    }
  }
};

const DICE = {
  ON_ROLL: socket => async bet => {
    try {
      // Validate bet schema
      const { error, value } = Joi.validate(bet, betSchema, {
        stripUnknown: true
      });
      if (error) throw error;

      bet = value;
      const user = await User.GetUserById(socket.user._id);

      // Check user has enough balance for bet
      const balance = user.getBalance(bet.coin);
      if (Big(bet.betAmount).gt(balance)) throw new Error("Not enough balance");

      // Check correctness of calculations
      const betNumber = dice.calculateBetNum(bet.payout, bet.isOver);
      if (!Big(bet.betNumber).eq(betNumber)) throw new Error("Incorrect odds");

      // Increase nonce
      user.nonce++;

      const rollNumber = dice.generateRollNum({
        clientSeed: user.clientSalt,
        serverSeed: user.serverSalt,
        nonce: user.nonce
      });

      // calculate outcome
      const profit = dice.calculateProfit({
        rollNumber,
        payout: bet.payout,
        betAmount: bet.betAmount,
        betNumber,
        isOver: bet.isOver
      });

      // Save bet
      let betEntry = new Bet({
        userid: user._id,
        userName: user.userName,
        clientSalt: user.clientSalt,
        serverSalt: user.serverSalt,
        hashedServerSalt: user.hashedServerSalt,
        nonce: user.nonce,
        amount: bet.betAmount,
        betNumber,
        rollNumber,
        isOver: bet.isOver,
        betTime: new Date(),
        coin: bet.coin,
        payout: bet.payout,
        profit
      });

      betEntry = await betEntry.save();

      await User.update(
        { _id: user._id, "funds.coinName": bet.coin },
        {
          $inc: {
            "funds.$.balance": profit,
            "funds.$.totalNetProfit": profit,
            "funds.$.totalWagered": bet.betAmount,
            nonce: 1
          }
        }
      ).exec();

      let newUser = await User.findOne({ _id: user._id }).exec();
      newUser = newUser.getPublicFields();

      // Send roll results
      broadcastThrottled(socket, betEntry.getPublicFields(), newUser);

      socket.emit(TYPES.DICE.ROLL_RESULT, {
        bet: betEntry.getPublicFields(),
        user: newUser
      });
    } catch (e) {
      console.log("ON_ROLL HANDLER ERR: ", e);
      return;
    }
  }
};

module.exports = {
  ON_CONNECT,
  ON_LOGIN,
  CHAT,
  DICE
};
