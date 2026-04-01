# cryptact CLI

A command-line interface for [cryptact](https://www.cryptact.com/) — the cryptocurrency tax calculation and portfolio tracking service. This tool allows you to manage your crypto tax data directly from your terminal.

## Table of Contents

- [What is cryptact?](#what-is-cryptact)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Global Options](#global-options)
- [Commands Reference](#commands-reference)
  - [Authentication](#authentication-auth)
  - [Ledger](#ledger-ledger)
  - [Transactions](#transactions-transaction)
  - [Exchange Integration](#exchange-integration-exchange)
  - [DeFi Wallets](#defi-wallets-wallet)
  - [Portfolio](#portfolio-portfolio)
  - [DeFi Transactions](#defi-transactions-defi)
  - [Live View](#live-view-live-view)
  - [Billing](#billing-billing)
  - [Settings](#settings-settings)
  - [Instruments](#instruments-instruments)
  - [User Account](#user-account-user)
  - [Mailing List](#mailing-list-mailing-list)
- [Common Workflows](#common-workflows)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

---

## What is cryptact?

cryptact is a service that helps you calculate taxes on your cryptocurrency transactions. It automatically imports your trading history from exchanges and DeFi wallets, calculates your gains and losses, and generates tax reports.

**Key concepts you'll encounter:**

- **Ledger**: Your personal tax calculation workspace. It contains all your transactions and settings for how taxes should be calculated.
- **Transaction**: Any crypto activity — buying, selling, trading, receiving mining rewards, etc.
- **Cost Basis Method**: The accounting method used to calculate your profit/loss (e.g., FIFO means "First In, First Out" — the oldest coins you bought are considered sold first).
- **DeFi**: Decentralized Finance — blockchain-based financial services like swapping tokens or providing liquidity.

---

## Installation

### Using npm (recommended)

```bash
npm install -g cryptact-cli
```

### Using npx (no installation required)

You can run commands directly without installing:

```bash
npx cryptact-cli auth login
```

### Verify installation

```bash
cryptact --version
```

---

## Quick Start

### 1. Log in to your account

```bash
cryptact auth login
```

This opens your web browser where you can log in with your cryptact credentials. Once logged in, you can close the browser — the CLI will remember your session.

### 2. Check your authentication status

```bash
cryptact auth status
```

### 3. View your ledger settings

```bash
cryptact ledger show
```

### 4. Search your transactions

```bash
cryptact transaction search --limit 10
```

---

## Global Options

These options work with any command:

| Option   | Description                                      |
| -------- | ------------------------------------------------ |
| `--json` | Output raw JSON data instead of formatted tables |
| `--help` | Show help for a command                          |

### Examples

```bash
# Get JSON output (useful for scripting)
cryptact ledger show --json

# Get help for a specific command
cryptact transaction search --help
```

---

## Commands Reference

### Authentication (`auth`)

Manage your login session. You must be logged in to use most other commands.

#### `auth login`

Log in to cryptact via your web browser.

```bash
cryptact auth login
```

**What happens:**

1. Your browser opens to the cryptact login page
2. Enter your email and password (or use social login)
3. After successful login, return to your terminal
4. Your session is saved locally for future commands

#### `auth logout`

Log out and clear your saved session.

```bash
cryptact auth logout
```

#### `auth status`

Check if you're currently logged in.

```bash
cryptact auth status
```

---

### Ledger (`ledger`)

Your ledger is where all your cryptocurrency transactions are stored and processed for tax calculations.

#### `ledger show`

Display your current ledger settings.

```bash
cryptact ledger show
```

**Output includes:**

- Reporting currency (e.g., JPY, USD)
- Cost basis method (FIFO, LIFO, etc.)
- Fiscal year settings
- Timezone

#### `ledger status`

Check if your ledger is currently processing transactions.

```bash
cryptact ledger status
```

**Possible states:**

- `idle` — No processing in progress
- `processing` — Currently calculating your taxes
- `error` — Something went wrong during processing

#### `ledger reprocess`

Trigger a recalculation of your taxes. Use this after adding new transactions or changing settings.

```bash
# Start reprocessing
cryptact ledger reprocess

# Force a complete rebuild (slower but thorough)
cryptact ledger reprocess --force-rebuild

# Reprocess only transactions after a specific date
cryptact ledger reprocess --from 1704067200
```

| Option               | Description                                         |
| -------------------- | --------------------------------------------------- |
| `--force-rebuild`    | Recalculate everything from scratch                 |
| `--from <timestamp>` | Only process transactions after this Unix timestamp |

#### `ledger summary`

View your yearly profit and loss summary for tax purposes.

```bash
cryptact ledger summary
```

#### `ledger download-preview`

See what tax reports are available for download.

```bash
cryptact ledger download-preview
```

#### `ledger download`

Request a tax report to be generated and sent to your email.

```bash
# Download report for the current fiscal year
cryptact ledger download

# Download report for a specific year
cryptact ledger download --year 2023
```

#### `ledger update`

Change your ledger settings.

```bash
# Change reporting currency to USD
cryptact ledger update --reporting-ccy USD

# Change cost basis method to LIFO
cryptact ledger update --cost-basis-method LIFO

# Set timezone
cryptact ledger update --timezone "America/New_York"
```

**Available options:**

| Option                            | Description                                             |
| --------------------------------- | ------------------------------------------------------- |
| `--reporting-ccy <ccy>`           | Currency for reports (USD, JPY, EUR, etc.)              |
| `--cost-basis-method <method>`    | FIFO, LIFO, HIFO, "Average Cost", or "Periodic Average" |
| `--fx-cost-basis-method <method>` | Cost basis method for foreign exchange                  |
| `--timezone <tz>`                 | Your timezone (e.g., "Asia/Tokyo", "America/New_York")  |
| `--fiscal-year-end-month <n>`     | Month when your fiscal year ends (1-12)                 |
| `--defi-translator <mode>`        | DeFi processing mode: CONFIRM or DIFFERENTIAL           |

---

### Transactions (`transaction`)

View and manage individual cryptocurrency transactions.

#### `transaction search`

Find transactions matching your criteria.

```bash
# Show recent transactions
cryptact transaction search --limit 20

# Find all Binance transactions
cryptact transaction search --source binance

# Find all BUY transactions
cryptact transaction search --action BUY

# Find transactions in a date range
cryptact transaction search --from 2024-01-01 --to 2024-03-31

# Find BTC/JPY trades from Coinbase
cryptact transaction search --source coinbase --pair BTC/JPY

# Find transactions with errors
cryptact transaction search --has-error
```

**Filter options:**

| Option                | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `--source <source>`   | Exchange name (e.g., binance, coinbase)               |
| `--action <action>`   | Transaction type (BUY, SELL, MINING, etc.)            |
| `--pair <pair>`       | Trading pair (e.g., BTC/JPY, ETH/USD)                 |
| `--fee-currency <fc>` | Currency used for fees                                |
| `--from <date>`       | Start date (YYYY-MM-DD)                               |
| `--to <date>`         | End date (YYYY-MM-DD)                                 |
| `--has-error`         | Show only transactions with errors                    |
| `--limit <n>`         | Maximum number of results                             |
| `--offset <n>`        | Skip this many results (for pagination)               |
| `--order <dir>`       | Sort order: ASC (oldest first) or DESC (newest first) |

#### `transaction show`

View details of a specific transaction.

```bash
cryptact transaction show <uuid>

# Example
cryptact transaction show 550e8400-e29b-41d4-a716-446655440000
```

#### `transaction edit`

Modify a transaction's details.

```bash
# Change the action type
cryptact transaction edit <uuid> --action SELL

# Update the price
cryptact transaction edit <uuid> --price 45000.50

# Add a comment
cryptact transaction edit <uuid> --comment "Manual correction"
```

**Edit options:**

| Option                | Description                                |
| --------------------- | ------------------------------------------ |
| `--action <action>`   | Transaction type                           |
| `--base <base>`       | Base currency (what you're buying/selling) |
| `--counter <counter>` | Counter currency (what you're paying with) |
| `--volume <volume>`   | Amount traded                              |
| `--price <price>`     | Price per unit                             |
| `--fee <fee>`         | Fee amount                                 |
| `--fee-currency <fc>` | Fee currency                               |
| `--source <source>`   | Source/exchange name                       |
| `--comment <comment>` | Add a note                                 |
| `--timestamp <ts>`    | Transaction time (ISO 8601 format)         |

#### `transaction delete`

Remove a transaction from your ledger.

```bash
cryptact transaction delete <uuid>
```

#### `transaction exclude`

Exclude a transaction from tax calculations (without deleting it).

```bash
# Exclude a transaction
cryptact transaction exclude <uuid>

# Re-include a previously excluded transaction
cryptact transaction exclude <uuid> --undo
```

#### `transaction summary`

View the profit/loss impact of a specific transaction.

```bash
cryptact transaction summary <uuid>
```

#### `transaction balance-summary`

View how a transaction affected your asset balances.

```bash
cryptact transaction balance-summary <uuid>
```

#### `transaction open-close`

View the cost basis details — which lots were "opened" (bought) and "closed" (sold).

```bash
cryptact transaction open-close <uuid>
```

#### `transaction loan-summary`

View loan-related details for a transaction (if applicable).

```bash
cryptact transaction loan-summary <uuid>
```

---

### Exchange Integration (`exchange`)

Connect to cryptocurrency exchanges to automatically import your trading history.

#### `exchange keys`

List all exchange API keys you've registered.

```bash
cryptact exchange keys
```

#### `exchange endpoints`

See what data types can be imported from an exchange.

```bash
cryptact exchange endpoints --exchange binance
```

#### `exchange key-add`

Register a new exchange API key to import your data.

```bash
cryptact exchange key-add \
  --exchange binance \
  --public-key "your-api-key" \
  --private-key "your-api-secret" \
  --endpoints '[{"endpoint":"trades"}]'
```

**Required options:**

| Option                  | Description                             |
| ----------------------- | --------------------------------------- |
| `--exchange <exchange>` | Exchange name (e.g., binance, coinbase) |
| `--public-key <key>`    | Your API key from the exchange          |
| `--private-key <key>`   | Your API secret from the exchange       |
| `--endpoints <json>`    | Data types to import (JSON array)       |

**Optional:**

| Option                  | Description                                 |
| ----------------------- | ------------------------------------------- |
| `--passphrase <phrase>` | API passphrase (required by some exchanges) |
| `--sub-account <name>`  | Sub-account name (if using sub-accounts)    |

#### `exchange key-delete`

Remove an exchange API key.

```bash
cryptact exchange key-delete --exchange binance
```

#### `exchange key-update`

Update which data types to import for an existing key.

```bash
cryptact exchange key-update \
  --exchange binance \
  --sub-account main \
  --endpoints '[{"endpoint":"trades"},{"endpoint":"deposits"}]'
```

#### `exchange sync`

Start importing data from an exchange.

```bash
# Sync all data from an exchange
cryptact exchange sync --exchange binance

# Sync only a specific data type
cryptact exchange sync --exchange binance --endpoint trades
```

#### `exchange sync-status`

Check the status of ongoing import jobs.

```bash
cryptact exchange sync-status
```

#### `exchange sync-cancel`

Cancel an ongoing import job.

```bash
cryptact exchange sync-cancel --exchange binance
```

#### `exchange processing-status`

Check the overall processing status of your exchange data.

```bash
cryptact exchange processing-status
```

#### `exchange files`

List CSV/Excel files you've uploaded.

```bash
cryptact exchange files
```

#### `exchange file-history`

View your file upload history.

```bash
cryptact exchange file-history
```

#### `exchange file-details`

View details about a specific uploaded file.

```bash
cryptact exchange file-details <fileId>
```

#### `exchange file-upload`

Upload a transaction file (CSV or Excel).

```bash
# Upload a custom format file
cryptact exchange file-upload ./my-transactions.csv \
  --exchange-file-id User.Custom

# Upload with timezone specified
cryptact exchange file-upload ./trades.csv \
  --exchange-file-id User.Custom \
  --timezone "America/New_York"
```

**Options:**

| Option                    | Description                                |
| ------------------------- | ------------------------------------------ |
| `--exchange-file-id <id>` | File format identifier (e.g., User.Custom) |
| `--timezone <tz>`         | Timezone for timestamps in the file        |
| `--password <pwd>`        | Password if the file is encrypted          |

---

### DeFi Wallets (`wallet`)

Manage blockchain wallet addresses for importing DeFi transactions.

#### `wallet list`

List all wallet addresses you've registered.

```bash
cryptact wallet list
```

#### `wallet add`

Add a wallet address for a specific blockchain.

```bash
cryptact wallet add \
  --chain ethereum \
  --address 0x742d35Cc6634C0532925a3b844Bc9e7595f...
```

**Options:**

| Option             | Description                                         |
| ------------------ | --------------------------------------------------- |
| `--chain <chain>`  | Blockchain name (ethereum, polygon, arbitrum, etc.) |
| `--address <addr>` | Your wallet address                                 |
| `--memo <memo>`    | Optional note or tag                                |

#### `wallet add-multi`

Add the same wallet address to multiple blockchains at once.

```bash
cryptact wallet add-multi \
  --chains ethereum,polygon,arbitrum \
  --address 0x742d35Cc6634C0532925a3b844Bc9e7595f...
```

#### `wallet update`

Update a wallet's memo/tag.

```bash
cryptact wallet update \
  --chain ethereum \
  --address 0x742d35... \
  --memo "Main trading wallet"
```

#### `wallet delete`

Remove a wallet address.

```bash
cryptact wallet delete --chain ethereum --address 0x742d35...
```

#### `wallet sync`

Start importing transactions from a wallet.

```bash
cryptact wallet sync --exchange ethereum
```

#### `wallet sync-status`

Check the status of wallet import jobs.

```bash
cryptact wallet sync-status
```

#### `wallet sync-cancel`

Cancel an ongoing wallet import.

```bash
cryptact wallet sync-cancel --exchange ethereum
```

---

### Portfolio (`portfolio`)

View your current holdings and historical performance.

#### `portfolio show`

Display your current portfolio holdings.

```bash
# Show portfolio in your default currency
cryptact portfolio show

# Show portfolio in USD
cryptact portfolio show --reporting-ccy USD
```

#### `portfolio history`

View how your portfolio changed over time.

```bash
# Detailed breakdown
cryptact portfolio history detailed

# Profit/loss over time
cryptact portfolio history detailed-pnl

# Global P&L summary
cryptact portfolio history global-pnl

# With date range (Unix timestamps)
cryptact portfolio history detailed --from 1704067200 --to 1735689600
```

**History types:**

- `detailed` — Full breakdown of holdings at each point
- `detailed-pnl` — Profit/loss details over time
- `global-pnl` — Overall profit/loss summary

#### `portfolio coin-history`

View the history of a specific cryptocurrency.

```bash
cryptact portfolio coin-history \
  --coin BTC \
  --from 1704067200 \
  --to 1735689600
```

---

### DeFi Transactions (`defi`)

Manage transactions from decentralized finance protocols.

#### `defi search`

Search your DeFi transactions.

```bash
# Search on Ethereum
cryptact defi search --chains ethereum

# Search multiple chains
cryptact defi search --chains ethereum,polygon

# Filter by date
cryptact defi search --chains ethereum \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-12-31T23:59:59Z
```

**Filter options:**

| Option                | Description                                    |
| --------------------- | ---------------------------------------------- |
| `--chains <chains>`   | Comma-separated blockchain names (required)    |
| `--start-time <time>` | Start time (ISO 8601 format)                   |
| `--end-time <time>`   | End time (ISO 8601 format)                     |
| `--addresses <addrs>` | Filter by wallet addresses                     |
| `--services <svcs>`   | Filter by DeFi protocols (uniswap, aave, etc.) |
| `--limit <n>`         | Maximum results                                |
| `--page <n>`          | Page number (starts at 0)                      |

#### `defi edit`

Correct how a DeFi transaction is classified.

```bash
cryptact defi edit \
  --chain ethereum \
  --tx-hash 0xabc123... \
  --action SWAP
```

**Action types:**

- `SWAP` — Token exchange
- `TRANSFER` — Sending/receiving tokens
- `BONUS` — Rewards received
- `LOSS` — Lost funds
- `PAY` — Payment for services
- `HARVEST` — Claiming farming rewards
- `ADD_LIQUIDITY` — Adding to a liquidity pool
- `REMOVE_LIQUIDITY` — Removing from a liquidity pool

#### `defi delete-edit`

Remove a manual classification you made.

```bash
cryptact defi delete-edit --chain ethereum --tx-hash 0xabc123...
```

#### `defi edits`

List all manual edits you've made to DeFi transactions.

```bash
cryptact defi edits --chains ethereum,polygon
```

#### `defi accept-all`

Accept all suggested classifications at once.

```bash
cryptact defi accept-all

# Accept only for a specific time period
cryptact defi accept-all \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-06-30T23:59:59Z
```

#### `defi mark-risky`

Mark unclassified transactions as risky (for review).

```bash
cryptact defi mark-risky --action SWAP
```

#### `defi mark-transfers-self`

Mark unclassified transfers as transfers between your own wallets.

```bash
cryptact defi mark-transfers-self
```

#### `defi stats`

View statistics about your DeFi activity.

```bash
cryptact defi stats

# Stats for a specific period
cryptact defi stats --start-time 2024-01-01T00:00:00Z
```

---

### Live View (`live-view`)

Monitor your current positions across exchanges in real-time.

#### `live-view position`

View your current holdings across exchanges.

```bash
cryptact live-view position \
  --reporting-ccy USD \
  --exchanges '[{"exchange":"binance"}]'
```

#### `live-view snapshots`

List available historical snapshots.

```bash
cryptact live-view snapshots
```

#### `live-view settings`

View your live-view sync settings.

```bash
cryptact live-view settings
```

#### `live-view enable`

Enable automatic position snapshots.

```bash
cryptact live-view enable
```

---

### Billing (`billing`)

Manage your cryptact subscription.

#### `billing plan`

View your current subscription plan.

```bash
cryptact billing plan
```

#### `billing plans`

See all available subscription plans.

```bash
cryptact billing plans
```

#### `billing invoices`

View your invoice history.

```bash
# View recent invoices
cryptact billing invoices

# Limit results
cryptact billing invoices --limit 5
```

---

### Settings (`settings`)

Manage your account preferences.

#### `settings show`

Display your current settings.

```bash
cryptact settings show
```

#### `settings update`

Update your settings.

```bash
# Change language to Japanese
cryptact settings update --language ja

# Change language to English
cryptact settings update --language en
```

---

### Instruments (`instruments`)

View supported cryptocurrencies and currencies.

#### `instruments list`

List all supported crypto and fiat currencies.

```bash
cryptact instruments list
```

---

### User Account (`user`)

View your account information.

#### `user info`

Display your account details.

```bash
cryptact user info
```

#### `user referrals`

View your referral statistics.

```bash
cryptact user referrals
```

---

### Mailing List (`mailing-list`)

Manage email subscriptions.

#### `mailing-list show`

View your current email subscription preferences.

```bash
cryptact mailing-list show
```

---

## Common Workflows

### First-time setup

```bash
# 1. Log in
cryptact auth login

# 2. Check your ledger settings
cryptact ledger show

# 3. Update settings if needed
cryptact ledger update --reporting-ccy USD --cost-basis-method FIFO
```

### Import exchange data

```bash
# 1. Check available endpoints for your exchange
cryptact exchange endpoints --exchange binance

# 2. Add your API key
cryptact exchange key-add \
  --exchange binance \
  --public-key "your-key" \
  --private-key "your-secret" \
  --endpoints '[{"endpoint":"trades"}]'

# 3. Start the sync
cryptact exchange sync --exchange binance

# 4. Check sync status
cryptact exchange sync-status

# 5. Reprocess your ledger
cryptact ledger reprocess
```

### Import DeFi wallet data

```bash
# 1. Add your wallet address
cryptact wallet add --chain ethereum --address 0x...

# 2. Start syncing
cryptact wallet sync --exchange ethereum

# 3. Check for transactions needing classification
cryptact defi search --chains ethereum

# 4. Reprocess your ledger
cryptact ledger reprocess
```

### Generate tax report

```bash
# 1. Ensure all data is processed
cryptact ledger status

# 2. View your P&L summary
cryptact ledger summary

# 3. Check available reports
cryptact ledger download-preview

# 4. Download report (sent to your email)
cryptact ledger download --year 2023
```

---

## Troubleshooting

### "Session expired" error

Your login session has expired. Log in again:

```bash
cryptact auth login
```

### "No ledger found" error

This usually means you haven't completed the initial setup on the cryptact website. Please visit [cryptact.com](https://www.cryptact.com/) to complete your account setup.

### Commands are slow

Some commands (especially sync operations) may take time depending on how much data needs to be processed. Use `--json` for faster raw output without formatting.

### Getting help

For any command, add `--help` to see available options:

```bash
cryptact ledger --help
cryptact transaction search --help
```

---

## Support

- **Website**: [cryptact.com](https://www.cryptact.com/)
- **Help Center**: [support.cryptact.com](https://support.cryptact.com/)
- **Email**: Contact us through the website

---

_This CLI is provided by cryptact. For the latest updates and documentation, visit our website._
