const crypto = require('crypto');

/**
 * @param {string} seed
 * @param {number} roundNumber
 * @returns {number} 
 */
function generateCrashPoint(seed, roundNumber) {
  const hash = crypto.createHash('sha256').update(seed + roundNumber).digest('hex');
  const intVal = parseInt(hash.slice(0, 8), 16);
  const r = intVal / 0xffffffff;

  const scaled = 0 + r * 5;
  return parseFloat(scaled.toFixed(2));
}


/**
 * @param {number} timeElapsed 
 * @returns {number} 
 */
function getMultiplier(timeElapsed) {
  const growthFactor = 0.05;
  return parseFloat((0 + timeElapsed * growthFactor).toFixed(2));
}

module.exports = {
  generateCrashPoint,
  getMultiplier
};
