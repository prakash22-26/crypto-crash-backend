const { generateCrashPoint, getMultiplier } = require('../utils/gameUtils');
const { v4: uuidv4 } = require('uuid');
const gameController = require('../controllers/gameController');
const GameRound = require('../models/GameRound');

module.exports = function (io) {
  let roundNumber = 1;
  let currentMultiplier = 1;
  let interval;
  let crashPoint;
  let currentRoundId;

  function startNewRound() {
    const seed = 'secret-seed'; 
    crashPoint = generateCrashPoint(seed, roundNumber);
    currentRoundId = uuidv4();
    let timeElapsed = 0;

    gameController.setGameState(currentRoundId, 1);
    io.emit('roundStart', { roundNumber });

    interval = setInterval(async () => {
      timeElapsed += 0.1;
      currentMultiplier = getMultiplier(timeElapsed);

      gameController.setGameState(currentRoundId, currentMultiplier);

      if (currentMultiplier >= crashPoint) {
        clearInterval(interval);
        io.emit('roundCrash', { roundNumber, crashPoint });

        await GameRound.create({
          roundId: currentRoundId,
          crashPoint,
          startTime: new Date(),
          bets: Object.values(gameController.getActiveBets()),
          cashouts: Object.values(gameController.getActiveBets()).filter(b => b.cashedOut)
        });

        gameController.resetBets();
        roundNumber++;
        setTimeout(startNewRound, 10000); 
      } else {
        io.emit('multiplierUpdate', currentMultiplier.toFixed(2));
      }
    }, 100); 
  }

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('cashout', async ({ playerId }) => {
      try {
        const { payoutUSD, multiplier } = await gameController.handleCashout(playerId);
        io.emit('playerCashout', { playerId, payoutUSD, multiplier });
      } catch (err) {
        console.error('Cashout error:', err.message);
        socket.emit('errorMessage', { error: err.message });
      }
    });
  });
  setTimeout(startNewRound, 1000);
};
