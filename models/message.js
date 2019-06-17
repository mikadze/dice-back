const config = require("../config");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    createTime: { type: Date },
    message: { type: String },
    author: { type: Object }
  },
  { autoIndex: config.DB.AUTO_INDEX, capped: true, size: 1053248, max: 400 }
);

const messageModel = mongoose.model("message", messageSchema);

module.exports = messageModel;
