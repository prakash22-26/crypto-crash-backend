const { v4: uuidv4 } = require('uuid');
const Player = require('../models/Player');
const Transaction = require('../models/Transaction');
const { getCryptoPrice } = require('../services/cryptoService');

let activeBets = {};
let currentMultiplier = 1;
let currentRoundId = null;

exports.placeBet = async (req, res) => {
  try {
    const { playerId, amount, currency } = req.body;

    if (!playerId || !amount || !currency || amount <= 0) {
      return res.status(400).json({ message: "Invalid bet request" });
    }

    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ message: "Player not found" });

    const price = await getCryptoPrice(currency === 'BTC' ? 'bitcoin' : 'ethereum');
    const cryptoAmount = amount / price;

    if (player.wallet[currency] < cryptoAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    player.wallet[currency] -= cryptoAmount;
    await player.save();

    await Transaction.create({
      playerId,
      usdAmount: amount,
      cryptoAmount,
      currency,
      type: "bet",
      hash: uuidv4(),
      priceAtTime: price
    });

    activeBets[playerId] = {
      playerId,
      usdAmount: amount,
      cryptoAmount,
      currency,
      cashedOut: false
    };

    res.json({ message: "Bet placed", cryptoAmount });

  } catch (err) {
    console.error("Bet error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.cashOut = async (req, res) => {
  try {
    const { playerId } = req.body;
    const result = await exports.handleCashout(playerId);
    res.json({ message: "Cashout successful", ...result });
  } catch (err) {
    console.error("Cashout error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

exports.handleCashout = async (playerId) => {
  const bet = activeBets[playerId];
  if (!bet || bet.cashedOut) {
    throw new Error("No active bet or already cashed out");
  }

  const price = await getCryptoPrice(bet.currency === 'BTC' ? 'bitcoin' : 'ethereum');
  const payoutCrypto = bet.cryptoAmount * currentMultiplier;
  const payoutUSD = payoutCrypto * price;

  const player = await Player.findById(playerId);
  player.wallet[bet.currency] += payoutCrypto;
  await player.save();

  await Transaction.create({
    playerId,
    usdAmount: payoutUSD,
    cryptoAmount: payoutCrypto,
    currency: bet.currency,
    type: "cashout",
    hash: uuidv4(),
    priceAtTime: price
  });

  bet.cashedOut = true;

  return { payoutUSD, multiplier: currentMultiplier };
};

exports.setGameState = (roundId, multiplier) => {
  currentRoundId = roundId;
  currentMultiplier = multiplier;
};

exports.getActiveBets = () => activeBets;

exports.resetBets = () => { activeBets = {}; };
