const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  raceNum: Number,
  horseNum: Number,
  betType: Number,
  _oddsType: Number,
  books: Number,
  f500: Number,
  odds100: Number,
  stake: Number,
  tax: Number,
  payout: Number,
  cancel: Number,
  nameClient: String,
  special: Number,
  rule4: Number,
  date: { type: Date , default: Date.now}
});

module.exports = mongoose.model('Item', ItemSchema);
