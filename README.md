#  Crypto Crash Game Backend

A real-time, provably fair crypto crash game built using **Node.js**, **Express**, **Socket.IO**, and **MongoDB**. Players can bet in BTC/ETH and cash out before the multiplier crashes!

##  Features

-  Real-time multiplier using WebSocket (Socket.IO)
-  Random crash point using provably fair logic
-  Supports BTC and ETH bets
-  Transaction history (bet and cashout)
-  Create new players dynamically
-  Fully modular backend architecture

##  Tech Stack

- **Backend:** Node.js, Express.js
- **Real-time Engine:** Socket.IO
- **Database:** MongoDB (via Mongoose)
- **Crypto Pricing:** CoinGecko API
- **Crash Logic:** Custom deterministic algorithm using `crypto`

##  Project Structure

```
crypto-crash-backend/
├── public/               # Frontend testing client (client.html)
├── scripts/              # Seed and player script
├── src/
│   ├── controllers/      # Bet, Cashout, Player logic
│   ├── models/           # Mongoose models
│   ├── routes/           # API endpoints
│   ├── services/         # Crypto price fetcher
│   ├── utils/            # Crash point logic
│   └── websocket/        # Real-time game manager
├── .env
├── package.json
└── README.md
```

##  Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/prakash22-26/crypto-crash-backend.git
cd crypto-crash-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/crypto_crash
```

### 4. Run the backend

```bash
npm run dev
```

> Starts on: `http://localhost:3000`

##  `seed.js`

Seeds the database with sample players.

**run the sample data:**
```bash
node scripts/seed.js
```

##  Test with Frontend

Open this file in your browser:

```
public/client.html
```

##  API Endpoints

### POST `/api/player/create`
Create a new player

**Request:**
```json
{
  "username": "prakash",
  "BTC": 0.01,
  "ETH": 0.2
}
```

**Response:**
```json
{
  "message": "Player created",
  "player": {
    "_id": "64fc123...",
    "username": "prakash",
    "wallet": { "BTC": 0.01, "ETH": 0.2 }
  }
}
```

---

### GET `/api/player/list`
Returns all registered players with wallet balances.

---

### POST `/api/game/bet`

**Request:**
```json
{
  "playerId": "64fc123...",
  "amount": 10,
  "currency": "BTC"
}
```

**Response:**
```json
{ "message": "Bet placed", "cryptoAmount": 0.0002 }
```

---

### POST `/api/game/cashout`

**Request:**
```json
{
  "playerId": "64fc123..."
}
```

**Response:**
```json
{
  "message": "Cashout successful",
  "payoutUSD": 25,
  "multiplier": 2.50
}
```

---

##  WebSocket Events

| Event Name         | Direction | Payload Format                            | Description                        |
|--------------------|-----------|-------------------------------------------|------------------------------------|
| `roundStart`       | Server → Client | `{ roundNumber }`                     | Announces the start of a round     |
| `multiplierUpdate` | Server → Client | `"2.45"`                              | Sends updated multiplier           |
| `roundCrash`       | Server → Client | `{ roundNumber, crashPoint }`         | Indicates crash occurred           |
| `playerCashout`    | Server → Client | `{ playerId, payoutUSD, multiplier }` | Successful cashout broadcast       |
| `cashout`          | Client → Server | `{ playerId }`                         | Player initiates cashout           |
| `errorMessage`     | Server → Client | `{ error }`                            | Server sends error to specific client |

---

##  Provably Fair Crash Algorithm

The game ensures fairness using a deterministic function:

```js
const hash = sha256(seed + roundNumber);
const r = parseInt(hash.slice(0, 8), 16) / 0xffffffff;
const crashPoint = 0 + r * 5;
```

- Server doesn’t change crash point after game starts
- Players can verify using the same seed logic

---

##  USD-to-Crypto Conversion

- Fetches live price from CoinGecko:
  ```
  https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd
  ```
- Converts:
  ```
  cryptoAmount = usdAmount / currentPrice
  ```

This allows you to place a bet in USD and deduct the equivalent in BTC or ETH from your wallet.

---

##  Architecture Overview

-  **Game Logic:** Server maintains crashPoint, timer, and rounds using `setInterval()`. Game resets every 10s.
-  **WebSocket Engine:** Uses `Socket.IO` to emit multiplier updates and receive cashouts.
-  **Transactions:** Every bet and cashout is logged to MongoDB (`transactions` collection).
-  **Crypto Price Integration:** Real-time USD-to-crypto conversion via CoinGecko.
-  **Provably Fair:** CrashPoint is calculated using SHA256 hash for fairness.

---

###  Created with  by Prakash
