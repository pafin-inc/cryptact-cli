# cryptact CLI

[![npm version](https://img.shields.io/npm/v/@pafin/cryptact-cli.svg)](https://www.npmjs.com/package/@pafin/cryptact-cli)
[![license](https://img.shields.io/npm/l/@pafin/cryptact-cli.svg)](https://github.com/pafin-inc/cryptact-cli/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@pafin/cryptact-cli.svg)](https://nodejs.org/)

> Manage your crypto taxes from the terminal — or bring your own agent.
> Import from 175+ exchanges and blockchains, track DeFi wallets, calculate gains, and generate tax reports.

---

## Why cryptact?

- **175+ exchanges and blockchains** — Binance, Coinbase, Kraken, Bybit, and [many more](https://grid.cryptact.com/exchanges).
- **27,000+** cryptocurrencies and **200+** fiat pairs [supported](https://grid.cryptact.com/coins).
- **DeFi wallet tracking** — Ethereum, Polygon, Arbitrum, and other EVM chains
- **Flexible cost basis** — FIFO, LIFO, HIFO, Average Cost, Periodic Average
- **Tax reports** — generate and download reports for your jurisdiction
- **JSON output** — pipe `--json` into `jq`, scripts, or your own tooling
- **Agent-friendly** — structured CLI designed for AI agents and automation

Learn more about all features at [cryptact.com](https://www.cryptact.com/en/features).

---

## Get Started

1. **[Register and try for free](https://www.pafin.com/en/signup?service=cryptact)** — all features available with a generous transaction limit
2. Install the CLI
3. Log in and start importing.

### Install

```bash
npm install -g @pafin/cryptact-cli
```

Or run directly with npx — no install needed:

```bash
npx @pafin/cryptact-cli auth login
```

**Requirements:** Node.js >= 22

### Log in

```bash
cryptact auth login
```

Your browser opens, you authenticate, and the CLI stores your session locally.

### Verify

```bash
cryptact auth status
cryptact ledger show
```

---

## Examples

### Import exchange data via API key

```bash
# Add your Binance API key
cryptact exchange key-add \
  --exchange binance \
  --public-key "your-key" \
  --private-key "your-secret" \
  --endpoints '[{"endpoint":"trades"}]'

# Sync and reprocess
cryptact exchange sync --exchange binance
cryptact ledger reprocess
```

### Import DeFi wallet transactions

```bash
# Add wallet and sync
cryptact wallet add --chain ethereum --address 0x742d35Cc...
cryptact wallet sync --exchange ethereum

# Review DeFi classifications
cryptact defi search --chains ethereum
```

### Generate a tax report

```bash
cryptact ledger status          # ensure processing is complete
cryptact ledger summary         # preview your P&L
cryptact ledger download --year 2025
```

### Scripting with JSON output

```bash
# Get raw JSON for any command
cryptact portfolio show --json

# Pipe into jq
cryptact transaction search --from 2025-01-01 --to 2025-12-31 --json \
  | jq '.[] | select(.action == "SELL")'

# Check ledger status in a script
STATUS=$(cryptact ledger status --json | jq -r '.status')
if [ "$STATUS" = "idle" ]; then
  cryptact ledger download --year 2025
fi
```

---

## Commands Overview

| Command        | Description                                       |
| -------------- | ------------------------------------------------- |
| `auth`         | Log in, log out, check session status             |
| `ledger`       | View settings, reprocess, download tax reports    |
| `transaction`  | Search, view, edit, delete transactions           |
| `exchange`     | Manage API keys, sync exchange data, upload files |
| `wallet`       | Add/remove DeFi wallets, sync blockchain data     |
| `portfolio`    | View holdings and historical performance          |
| `defi`         | Search and classify DeFi transactions             |
| `live-view`    | Monitor real-time positions across exchanges      |
| `billing`      | View subscription plan and invoices               |
| `settings`     | Update language and preferences                   |
| `instruments`  | List supported coins and currencies               |
| `user`         | View account info and referrals                   |
| `mailing-list` | View email subscriptions                          |

Every command supports `--help` for detailed usage and `--json` for machine-readable output.

For the full command reference, see [docs/commands.md](docs/commands.md).

---

## Common Workflows

### First-time setup

```bash
cryptact auth login
cryptact ledger show
cryptact ledger update --reporting-ccy USD --cost-basis-method FIFO
```

### Upload a CSV file

```bash
cryptact exchange file-upload ./trades.csv \
  --exchange-file-id User.Custom \
  --timezone "America/New_York"
```

### Track multiple chains with one wallet

```bash
cryptact wallet add-multi \
  --chains ethereum,polygon,arbitrum \
  --address 0x742d35Cc...
```

---

## Troubleshooting

### Session expired

```bash
cryptact auth login
```

### No ledger found

Complete your initial setup at [cryptact.com](https://www.cryptact.com/) first, then return to the CLI.

### Need help with a command?

```bash
cryptact <command> --help
```

---

## Support

- **Website**: [cryptact.com](https://www.cryptact.com/)
- **Help Center**: [support.cryptact.com](https://support.cryptact.com/)

---

## License

MIT
