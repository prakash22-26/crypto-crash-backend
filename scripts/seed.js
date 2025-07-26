require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('../src/models/Player');

const MONGO_URI = process.env.MONGO_URI;

const seedPlayers = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to MongoDB");

    await Player.deleteMany();

    const players = [
      {
        username: 'player1',
        wallet: {
          BTC: 0.005,
          ETH: 0.2
        }
      },
      {
        username: 'player2',
        wallet: {
          BTC: 0.003,
          ETH: 0.1
        }
      },
      {
        username: 'player3',
        wallet: {
          BTC: 0.01,
          ETH: 0.5
        }
      }
    ];

    const inserted = await Player.insertMany(players);
    console.log('Sample players inserted:\n');

    inserted.forEach(player => {
      console.log(`Username: ${player.username}`);
      console.log(`ID: ${player._id}\n`);
    });

  } catch (error) {
    console.error('Seed failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

seedPlayers();
