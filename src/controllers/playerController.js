const Player = require('../models/Player');
const { getCryptoPrice } = require('../services/cryptoService');

exports.listPlayers = async (req, res) => {
  try {
    const players = await require('../models/Player').find();
    res.json(players);
  } catch (err) {
    console.error("Error fetching player list:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getWallet = async (req, res) => {
  try {
    const { id } = req.params;

    const player = await Player.findById(id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const btcPrice = await getCryptoPrice('bitcoin');
    const ethPrice = await getCryptoPrice('ethereum');

    const wallet = {
      BTC: {
        amount: player.wallet.BTC,
        usd: (player.wallet.BTC * btcPrice).toFixed(2)
      },
      ETH: {
        amount: player.wallet.ETH,
        usd: (player.wallet.ETH * ethPrice).toFixed(2)
      }
    };

    res.json({
      playerId: player._id,
      username: player.username,
      wallet
    });

  } catch (err) {
    console.error("Wallet fetch error:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


