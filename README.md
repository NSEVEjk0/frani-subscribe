# Frani Subscribe

Consent-based recurring payments on Unicity testnet2. A payer subscribes to a
periodic amount; each period a payment becomes due and the subscription tracks
paid rounds until it is cancelled.

Made by **CRYPTFRANI**. Owner / creator: **Itachi**.

---

## Track

Payments and markets.

## Is it Agentic?

No. Frani Subscribe schedules dues and records paid rounds against fixed rules.
No autonomous behaviour, no model in the loop.

## Runs on AstridOS?

No.

## Live on-network

- Network: **testnet2**
- Each deployment holds its own wallet and prints its address at startup.

## SDK features used

| Feature | Where |
|---|---|
| Wallet identity | `src/wallet.js` (Sphere SDK) |
| Payment requests (concept) | each due round maps to an invoice/request |

## Commands

```bash
npm run new -- --payer 0x… --payee 0x… --amount 10 --cadence weekly
npm run pay -- <subscriptionId>
npm run due -- <subscriptionId>
npm run cancel -- <subscriptionId>
```
