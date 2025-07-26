const axios = require('axios');

let cachedPrices = {};
let lastFetched = 0;

/**
 * @param {string} symbol 
 * @returns {Promise<number>} 
 */
async function getCryptoPrice(symbol = 'bitcoin') {
  const now = Date.now();

  if (now - lastFetched < 10000 && cachedPrices[symbol]) {
    return cachedPrices[symbol];
  }

  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: symbol,
        vs_currencies: 'usd'
      }
    });

    const usdPrice = response.data[symbol].usd;
    cachedPrices[symbol] = usdPrice;
    lastFetched = now;

    return usdPrice;

  } catch (error) {
    console.error(`Failed to fetch ${symbol} price from CoinGecko:`, error.message);
    if (cachedPrices[symbol]) {
      console.warn(`Using cached ${symbol} price.`);
      return cachedPrices[symbol];
    } else {
      throw new Error('No price data available.');
    }
  }
}

module.exports = {
  getCryptoPrice
};
