const router = require('express').Router();
const gameController = require('../controllers/gameController');

router.post('/bet', gameController.placeBet);

router.post('/cashout', gameController.cashOut);

module.exports = router;
