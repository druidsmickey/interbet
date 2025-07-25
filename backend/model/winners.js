const mongoose = require('mongoose');

const WinnerSchema = new mongoose.Schema({
  raceNum: {
    type: Number,
    required: true
  },
  winNum: {
    type: Array, // Correctly declare horseNum as an array of booleans
    required: true
  },
  specialNum: {
    type: Array, // Correctly declare specialNum as an array of booleans
    required: true
  },
  rule4Num: {
    type: Array, // Correctly declare rule4Num as an array of booleans
    required: true
  },
  rule4Deduction: {
    type: Number, // Correctly declare rule4Deduction as a number
    required: true
  },
  date: { type: Date, default: Date.now }
}, { strict: true });

module.exports = mongoose.model('Winners', WinnerSchema);
