const mongoose = require('mongoose');
const {Schema} = mongoose;

const date = new Date();

const replySchema = new Schema({
  text: { type: String },
  delete_password: { type: String },
  created_on: { type: Date, default: date },
  bumped_on: { type: Date, default: date },
  reported: { type: Boolean, default: false }
});
const reply = mongoose.model('reply', replySchema);

const threadSchema = new Schema({
  text: { type: String },
  delete_password: { type: String },
  created_on: { type: Date, default: date },
  bumped_on: { type: Date, default: date },
  reported: { type: Boolean, default: false },
  replies: { type: [replySchema] }
});

const thread = mongoose.model('thread', threadSchema);

const boardSchema = new Schema({
  name: { type: String },
  threads: { type: [threadSchema] }
});

  const board = mongoose.model('board', boardSchema);

exports.board = board;
exports.thread = thread;
exports.reply = reply;