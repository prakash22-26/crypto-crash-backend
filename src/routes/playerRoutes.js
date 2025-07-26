const router = require('express').Router();
const { getWallet,listPlayers } = require('../controllers/playerController');

router.get('/:id/wallet', getWallet);

router.get('/list', listPlayers);

router.post('/create', async (req, res) => {
  try {
    const Player = require('../models/Player');
    const { username, BTC, ETH } = req.body;

    const newPlayer = await Player.create({
      username,
      wallet: {
        BTC: BTC || 0,
        ETH: ETH || 0
      }
    });

    res.json({ message: "Player created", player: newPlayer });
  } catch (err) {
    console.error("Create player error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
