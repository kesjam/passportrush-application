# BTC Cloud Reclaim Webhook (Robinhood + TradingView)

This project listens for TradingView strategy alerts and sends crypto orders to Robinhood using their Crypto API.

## 🔧 Setup

1. Deploy this repo to Vercel
2. Add environment variables in Vercel:
   - `ROBINHOOD_AUTH_TOKEN`
   - `ROBINHOOD_ACCOUNT_ID`
   - `BTC_INSTRUMENT_ID`
   - `SECRET_KEY`

3. In TradingView, use this JSON for alerts:

**BUY Alert**
```json
{
  "action": "buy",
  "ticker": "BTCUSD",
  "key": "your_secret_key"
}
```

**SELL Alert**
```json
{
  "action": "sell",
  "ticker": "BTCUSD",
  "key": "your_secret_key"
}
```

Test your endpoint by visiting `/webhook` or using curl.

---
⚠️ Always test with paper amounts or staging before live trading.
