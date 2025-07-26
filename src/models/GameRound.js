const mongoose = require('mongoose');

const gameRoundSchema = new mongoose.Schema({
  roundId: {
    type: String,
    required: true
  },
  crashPoint: {
    type: Number,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  bets: [
    {
      playerId: String,
      usdAmount: Number,
      cryptoAmount: Number,
      currency: String,
      cashedOut: Boolean
    }
  ],
  cashouts: [
    {
      playerId: String,
      usdAmount: Number,
      cryptoAmount: Number,
      currency: String,
      multiplier: Number
    }
  ]
});

module.exports = mongoose.model('GameRound', gameRoundSchema);
