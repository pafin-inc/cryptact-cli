# cryptact CLI — Command Reference

Full reference for all cryptact CLI commands. For a quick overview, see the [README](../README.md).

## Global Options

These options work with any command:

| Option              | Description                                       |
| ------------------- | ------------------------------------------------- |
| `--json`            | Output raw JSON data instead of formatted tables  |
| `--format <format>` | Output format: `table` (default), `json`, or `csv` |
| `--help`            | Show help for a command                           |

Destructive commands (deletes, bulk mutations, `ledger reprocess`) refuse to run
without `--execute` and exit with code 4. Paginated search commands accept
`--all` to fetch and combine every page, plus `--max-pages <n>` to cap the walk.

---

## Authentication (`auth`)

Manage your login session. You must be logged in to use most other commands.

### `auth login`

Log in to cryptact via your web browser.

```bash
cryptact auth login
```

**What happens:**

1. Your browser opens to the cryptact login page
2. Enter your email and password (or use social login)
3. After successful login, return to your terminal
4. Your session is saved locally for future commands

### `auth logout`

Log out and clear your saved session.

```bash
cryptact auth logout
```

### `auth status`

Check if you're currently logged in.

```bash
cryptact auth status
```

---

## Ledger (`ledger`)

Your ledger is where all your cryptocurrency transactions are stored and processed for tax calculations.

### `ledger show`

Display your current ledger settings.

```bash
cryptact ledger show
```

**Output includes:**

- Reporting currency (e.g., JPY, USD)
- Cost basis method (FIFO, LIFO, etc.)
- Fiscal year settings
- Timezone

### `ledger status`

Check if your ledger is currently processing transactions.

```bash
cryptact ledger status
```

**Possible states** (in `processStatus.state`):

- `UNSTARTED` — no processing has run yet
- `PREPARING`, `QUEUED_PROCESS`, `QUEUED_UPLOAD`, `QUEUED_DOWNLOAD`, `RUNNING`, `UPLOADING`, `DOWNLOADING` — processing in progress
- `DONE` — finished successfully
- `ERROR`, `TIMEOUT` — something went wrong during processing

### `ledger list`

List the ledger IDs on your account.

```bash
cryptact ledger list
```

### `ledger reprocess`

Trigger a recalculation of your taxes. Use this after adding new transactions or changing settings.

This command is destructive: it refuses to run without `--execute`.

```bash
# Start reprocessing
cryptact ledger reprocess --execute

# Force a complete rebuild (slower but thorough)
cryptact ledger reprocess --force-rebuild true --execute

# Reprocess only transactions after a specific date
cryptact ledger reprocess --from 1704067200000 --execute

# Trigger and poll until processing completes
cryptact ledger reprocess --execute --wait
```

| Option               | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| `--force-rebuild <true\|false>` | Recalculate everything from scratch                     |
| `--from <timestamp>` | Only process transactions after this Unix timestamp (milliseconds) |
| `--wait`             | Poll processing status until it completes                          |

### `ledger summary`

View your yearly profit and loss summary for tax purposes.

```bash
cryptact ledger summary
```

### `ledger download-preview`

See what tax reports are available for download.

```bash
cryptact ledger download-preview
```

### `ledger download`

Request a tax report to be generated and sent to your email. `--year` is required (accepts `null`).

```bash
cryptact ledger download --year 2023
```

### `ledger update`

Change your ledger settings.

Settings are passed as `--ledger.*` dot-path flags (or one `--ledger <json>` object).

The route requires the **complete** settings object — every key below must be present. Fetch the
current settings with `cryptact ledger show --json`, edit, and send the whole object back. Passing
only the fields you want to change returns 400.

```bash
# Read current settings, change reporting currency, send the full object back
cryptact ledger show --json | jq '.ledger | .reportingCcy = "USD"' > ledger.json
cryptact ledger update --ledger "$(cat ledger.json)"
```

**Available options:**

| Option                                            | Description                                             |
| ------------------------------------------------- | ------------------------------------------------------- |
| `--ledger.reporting-ccy <reporting-ccy>`          | Currency for reports (USD, JPY, EUR, etc.)              |
| `--ledger.cost-basis-method <cost-basis-method>`  | FIFO, LIFO, HIFO, "Average Cost", "Periodic Average", or "Monthly Periodic Average" |
| `--ledger.fx-cost-basis-method <fx-cost-basis-method>` | Cost basis method for foreign exchange             |
| `--ledger.timezone <timezone>`                    | Your timezone (e.g., "Asia/Tokyo", "America/New_York")  |
| `--ledger.fiscal-year-end-month <fiscal-year-end-month>` | Month when your fiscal year ends (1-12, or 45 for the UK 6-April fiscal year) |
| `--ledger.defi-translator <defi-translator>`      | DeFi processing mode: CONFIRM or DIFFERENTIAL           |
| `--ledger <json>`                                 | Full settings object (alternative to the flags above)   |

---

## Transactions (`transaction`)

View and manage individual cryptocurrency transactions.

### `transaction search`

Find transactions matching your criteria. Filters are passed as `--filter.*` dot-path flags (or one `--filter <json>` object); array-valued filters take JSON arrays.

```bash
# Show recent transactions
cryptact transaction search --filter.limit 20

# Find all Binance transactions
cryptact transaction search --filter.source '["binance"]'

# Find all BUY transactions
cryptact transaction search --filter.action '["BUY"]'

# Find transactions in a date range
cryptact transaction search --filter.from 2024-01-01 --filter.to 2024-03-31

# Find BTC/JPY trades from Coinbase
cryptact transaction search --filter.source '["coinbase"]' --filter.pair '["BTC/JPY"]'

# Find transactions with errors
cryptact transaction search --filter.has-error true

# Fetch every page of results
cryptact transaction search --filter.source '["binance"]' --all
```

**Filter options:**

| Option                | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `--filter.source <json>`   | JSON array of exchange names, e.g. `'["binance"]'` |
| `--filter.action <json>`   | JSON array of transaction types (BUY, SELL, MINING, etc.) |
| `--filter.pair <json>`     | JSON array of trading pairs, e.g. `'["BTC/JPY"]'` |
| `--filter.fee-currency <json>` | JSON array of fee currencies                   |
| `--filter.from <from>`     | Start date (YYYY-MM-DD)                           |
| `--filter.to <to>`         | End date (YYYY-MM-DD)                             |
| `--filter.has-error <true\|false>` | Show only transactions with errors        |
| `--filter.limit <n>`       | Maximum number of results                         |
| `--filter.order-by <json>` | Sort order, e.g. `'[{"column":"ts","order":"DESC"}]'` |
| `--filter <json>`          | Full filter object (alternative to the flags above) |
| `--offset <n>`             | Skip this many results (for pagination)           |
| `--all`                    | Fetch every page and combine results              |

### `transaction show`

View details of a specific transaction. `--transaction-type` selects `unprocessed` (raw imports) or `processed` (calculated results); it defaults to `processed`.

```bash
cryptact transaction show <transactionId> --transaction-type processed
```

### `transaction edit`

Modify a transaction's details. Fields use the backend's short forms, passed as `--transaction.*` dot-path flags (or one `--transaction <json>` object).

The route requires the **complete** transaction object (`act, bc, cc, comment, efi, fc, fee, prc,
src, ts, uuid, vol`). Read the raw row first, edit, and send the whole object back. Passing only the
field you want to change returns 400.

Read the **unprocessed** row, not the processed one: the processed row carries ledger-engine-derived
`vol`/`prc`/`fee`, and writing those back corrupts the raw data.

```bash
cryptact transaction show <transactionId> --transaction-type unprocessed --json \
  | jq '.detail | .comment = "Manual correction"' > tx.json
cryptact transaction edit <transactionId> --transaction "$(cat tx.json)"
```

**Edit options:**

| Option                            | Description                                |
| --------------------------------- | ------------------------------------------ |
| `--transaction.act <act>`         | Transaction type (see: `cryptact reference show transaction_action`) |
| `--transaction.bc <bc>`           | Base currency (what you're buying/selling) |
| `--transaction.cc <cc>`           | Counter currency (what you're paying with) |
| `--transaction.vol <vol>`         | Amount traded                              |
| `--transaction.prc <prc>`         | Price per unit, in `cc`                    |
| `--transaction.fee <fee>`         | Fee amount, in `fc`                        |
| `--transaction.fc <fc>`           | Fee currency                               |
| `--transaction.src <src>`         | Source/exchange name                       |
| `--transaction.comment <comment>` | Add a note                                 |
| `--transaction.ts <ts>`           | Transaction timestamp (ISO 8601)           |
| `--transaction <json>`            | Full transaction object (alternative to the flags above) |

### `transaction delete`

Remove a transaction from your ledger (alias of `delete-transactions`; destructive, requires `--execute`).

```bash
cryptact transaction delete --transaction.uuid <uuid> --execute
```

### `transaction exclude`

Exclude a transaction from tax calculations (without deleting it). Takes the transaction ID and the action (`exclude` or `unexclude`) as positionals. The API also requires the transaction's `ts` — read it from `transaction show`.

```bash
# Look up the transaction's ts first
cryptact transaction show <transactionId> --transaction-type processed

# Exclude a transaction
cryptact transaction exclude <transactionId> exclude --transaction.ts <ts>

# Re-include a previously excluded transaction
cryptact transaction exclude <transactionId> unexclude --transaction.ts <ts>
```

### `transaction summary`

View the profit/loss impact of a specific transaction.

```bash
cryptact transaction summary <transactionId>
```

### `transaction balance-summary`

View how a transaction affected your asset balances.

```bash
cryptact transaction balance-summary <transactionId>
```

### `transaction open-close`

View the cost basis details — which lots were "opened" (bought) and "closed" (sold).

```bash
cryptact transaction open-close <transactionId>
```

### `transaction loan-summary`

View loan-related details for a transaction (if applicable).

```bash
cryptact transaction loan-summary <transactionId>
```

---

## Exchange Integration (`exchange`)

Connect to cryptocurrency exchanges to automatically import your trading history.

### `exchange keys`

List all exchange API keys you've registered.

```bash
cryptact exchange keys
```

### `exchange endpoints`

See what data types can be imported from an exchange.

```bash
cryptact exchange endpoints --exchange binance
```

### `exchange key-add`

Register a new exchange API key to import your data.

```bash
cryptact exchange key-add \
  --exchange binance \
  --public-key "your-api-key" \
  --private-key "your-api-secret" \
  --passphrase "" \
  --sub-account "" \
  --endpoints '[{"endpoint":"trades","isFromFiles":false}]'
```

`--passphrase` and `--sub-account` default to an empty string, for the exchanges that don't use them; the rest are required.

| Option                          | Description                             |
| ------------------------------- | --------------------------------------- |
| `--exchange <exchange>`         | Exchange name (e.g., binance, coinbase) |
| `--public-key <public-key>`     | Your API key from the exchange          |
| `--private-key <private-key>`   | Your API secret from the exchange       |
| `--endpoints <json>`            | Data types to import — JSON array of `{"endpoint", "isFromFiles", "startTimestampMs"?}` (see: `cryptact reference show exchange_api_endpoint`) |
| `--passphrase <passphrase>`     | API passphrase (used by some exchanges) |
| `--sub-account <sub-account>`   | Sub-account name (if using sub-accounts) |

### `exchange key-delete`

Remove an exchange API key. Destructive: requires `--execute`. Both `--exchange` and `--sub-account` are required.

```bash
cryptact exchange key-delete --exchange binance --sub-account "" --execute
```

### `exchange key-update`

Update which data types to import for an existing key.

```bash
cryptact exchange key-update \
  --exchange binance \
  --sub-account main \
  --endpoints '[{"endpoint":"trades","isFromFiles":false},{"endpoint":"deposits","isFromFiles":false}]'
```

### `exchange sync`

Start importing data from an exchange. `--exchange-id` takes a CEX exchange ID (e.g. `binance`), a DeFi chain ID (e.g. `ethereum`), the literal `defi` for all chains, or a chain family (`EVM`, `SOLANA`, ...). Omit it to sync every connected exchange.

```bash
# Sync every connected exchange
cryptact exchange sync

# Sync all data from one exchange
cryptact exchange sync --exchange-id binance

# Sync only a specific data type
cryptact exchange sync --exchange-id binance --endpoint trades
```

### `exchange sync-status`

Check the status of ongoing import jobs.

```bash
cryptact exchange sync-status
```

### `exchange sync-cancel`

Cancel ongoing import jobs. `--filters` is a required JSON array of `{"exchange", "subAccount"?, "endpoint"?}` — use `"defi"` as the exchange for blockchain sync jobs.

```bash
cryptact exchange sync-cancel --filters '[{"exchange":"binance"}]'
```

### `exchange processing-status`

Check the overall processing status of your exchange data.

```bash
cryptact exchange processing-status
```

### `exchange files`

List CSV/Excel files you've uploaded.

```bash
cryptact exchange files
```

### `exchange file-history`

View your file upload history.

```bash
cryptact exchange file-history
```

### `exchange file-details`

View details about a specific uploaded file.

```bash
cryptact exchange file-details --file-id 123
```

### `exchange file-upload`

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
| `--exchange-file-id <id>` | File format identifier, required (see: `cryptact reference show exchange-file-id`) |
| `--timezone <tz>`         | Timezone for timestamps in the file        |
| `--sub-id <subId>`        | Sub ID                                     |
| `--password <password>`   | Password if the file is encrypted          |

---

## DeFi Wallets (`wallet`)

Manage blockchain wallet addresses for importing DeFi transactions.

### `wallet list`

List all wallet addresses you've registered.

```bash
cryptact wallet list
```

### `wallet add`

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

### `wallet add-multi`

Add the same wallet address to multiple blockchains at once.

```bash
cryptact wallet add-multi \
  --chains '["ethereum","polygon","arbitrum"]' \
  --address 0x742d35Cc6634C0532925a3b844Bc9e7595f...
```

### `wallet update`

Update a wallet's memo/tag.

```bash
cryptact wallet update \
  --chain ethereum \
  --address 0x742d35... \
  --memo "Main trading wallet"
```

### `wallet delete`

Remove a wallet address. Destructive: requires `--execute`.

```bash
cryptact wallet delete --chain ethereum --address 0x742d35... --execute
```

### `wallet delete-all`

Remove **all** DeFi wallet addresses from the ledger. Destructive: requires `--execute`.

```bash
cryptact wallet delete-all --execute
```

### Syncing wallets

Wallet sync runs through the `exchange` group — pass the chain (or `defi` for all chains) as the exchange ID:

```bash
# Start importing transactions from your Ethereum wallets
cryptact exchange sync --exchange-id ethereum

# Check the status of import jobs
cryptact exchange sync-status

# Cancel ongoing blockchain imports
cryptact exchange sync-cancel --filters '[{"exchange":"defi"}]'
```

---

## Portfolio (`portfolio`)

View your current holdings and historical performance.

### `portfolio show`

Display your current portfolio holdings.

```bash
# Show portfolio in the ledger's own currency (--reporting-ccy omitted)
cryptact portfolio show

# Show portfolio in USD
cryptact portfolio show --reporting-ccy USD
```

### `portfolio history`

View how your portfolio changed over time. The request schema is a union of shapes, so the payload is passed as a single required `--body <json>`.

```bash
# Detailed breakdown of holdings at each point
cryptact portfolio history --body '{"aggregateType":"detailed"}'

# Profit/loss over time, within a range (Unix seconds)
cryptact portfolio history --body '{"aggregateType":"detailed-pnl","from":1704067200,"to":1735689600}'

# Overall profit/loss summary
cryptact portfolio history --body '{"aggregateType":"global-pnl"}'
```

**Aggregate types (`aggregateType`):**

- `detailed` — Full breakdown of holdings at each point
- `detailed-pnl` — Profit/loss details over time
- `global-pnl` — Overall profit/loss summary
- `global` — Single-asset history; additionally requires `instrumentId`, `from`, `to`

### Single-asset history

`portfolio history` takes the whole payload as JSON (the route's request schema is a union of
aggregate shapes), so a single-asset query passes `aggregateType: "global"` with the instrument and
range. `from`/`to` are Unix timestamps in seconds.

```bash
cryptact portfolio history --body '{"aggregateType":"global","instrumentId":"BTC","from":1704067200,"to":1735689600}'
```

---

## DeFi Transactions (`defi`)

Manage transactions from decentralized finance protocols.

### `defi search`

Search your DeFi transactions across the ledger. Pass `--limit` — when omitted it reaches the API as 0 and returns no transactions (use `0` deliberately to read the total count alone).

```bash
# Search the EVM family (the default)
cryptact defi search --limit 20

# Search specific chains (UPPERCASE names, with their family)
cryptact defi search --chain-family EVM --chains '["ETHEREUM","POLYGON"]' --limit 20

# Unclassified transactions needing review
cryptact defi search --quick-filter CONFIRM --limit 20

# Filter by date (epoch milliseconds, as strings)
cryptact defi search --limit 20 \
  --start-time 1704067200000 \
  --end-time 1735689599000
```

**Filter options:**

| Option                            | Description                                    |
| --------------------------------- | ---------------------------------------------- |
| `--chains <json>`                 | JSON array of UPPERCASE chain names, e.g. `'["ETHEREUM"]'` (see: `cryptact reference show chain`). Omit to search every chain in the family |
| `--chain-family <chain-family>`   | `EVM`, `SOLANA`, `COSMOS`, `BITCOIN`, `CARDANO`, or `SUI`. Required in practice whenever `--chains` is set; omit both to search EVM |
| `--addresses <json>`              | JSON array of your own wallet addresses        |
| `--services <json>`               | JSON array of contract service names           |
| `--action-detail <json>`          | JSON array of effective action details (see: `cryptact reference show action-detail`) |
| `--asset-hashes <json>`           | JSON array of asset identifiers (contract address on EVM, mint on Solana, ...) |
| `--methods <json>`                | JSON array of method IDs (hex). EVM only       |
| `--quick-filter <quick-filter>`   | Preset bucket, e.g. `CONFIRM` (unclassified) or `IDENTIFIED_ALL` (classified) |
| `--start-time <start-time>`       | Start time (epoch milliseconds, as a string)   |
| `--end-time <end-time>`           | End time (epoch milliseconds, as a string)     |
| `--sort-order <sort-order>`       | Sort by timestamp: `ASC` (default) or `DESC`   |
| `--limit <n>`                     | Page size (omitted means 0 — no results)       |
| `--page <n>`                      | Page number (1-based)                          |

### `defi edit`

Correct how DeFi transactions are classified. `--transactions` is a JSON array of `[chain, txHash]` pairs (UPPERCASE chain names). `--action` is required; `--transfer-type` takes `BONUS`, `GIVE`, `PAY`, `RECEIVE`, `SELF`, or `LOSS` for `TRANSFER` actions and defaults to `null` otherwise. `--action null` clears an existing manual edit.

```bash
cryptact defi edit \
  --transactions '[["ETHEREUM","0xabc123..."]]' \
  --action SWAP \
  --transfer-type null
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

### `defi delete-edit`

Remove manual classifications you made. Destructive: requires `--execute`.

```bash
cryptact defi delete-edit --transactions '[["ETHEREUM","0xabc123..."]]' --execute
```

### `defi edits`

List all manual edits you've made to DeFi transactions. `--chains` is a required JSON array of UPPERCASE chain names.

```bash
cryptact defi edits --chains '["ETHEREUM","POLYGON"]'
```

### `defi accept-all`

Accept all suggested classifications at once. Destructive: requires `--execute`.

```bash
cryptact defi accept-all --execute

# Accept only for a specific time period (epoch milliseconds)
cryptact defi accept-all \
  --start-time 1704067200000 \
  --end-time 1719791999000 \
  --execute
```

### `defi mark-risky`

Mark unclassified transactions as risky, assigning them an action (e.g. `FEEONLY`, `BONUS`, `PAY`). Destructive: requires `--execute`.

```bash
cryptact defi mark-risky --action FEEONLY --execute
```

### `defi mark-transfers-self`

Mark unclassified transfers as transfers between your own wallets. Destructive: requires `--execute`.

```bash
cryptact defi mark-transfers-self --execute
```

### `defi stats`

View statistics about your DeFi activity.

```bash
cryptact defi stats

# Stats from a start time (epoch milliseconds)
cryptact defi stats --start-time 1704067200000
```

---

## Live View (`live-view`)

Monitor your current positions across exchanges in real-time.

### `live-view position`

View your current holdings across exchanges.

```bash
cryptact live-view position \
  --reporting-ccy USD \
  --exchanges '[{"exchange":"binance"}]'
```

### `live-view snapshots`

List available historical snapshots.

```bash
cryptact live-view snapshots
```

### `live-view settings`

View your live-view sync settings.

```bash
cryptact live-view settings
```

### `live-view enable`

Enable automatic position snapshots.

```bash
cryptact live-view enable
```

---

## Billing (`billing`)

Manage your cryptact subscription.

### `billing plan`

View your current subscription plan.

```bash
cryptact billing plan
```

### `billing plans`

See all available subscription plans.

```bash
cryptact billing plans
```

### `billing invoices`

View your invoice history.

```bash
# View recent invoices
cryptact billing invoices

# Limit results
cryptact billing invoices --limit 5
```

---

## Settings (`settings`)

Manage your account preferences.

### `settings show`

Display your current settings.

```bash
cryptact settings show
```

### `settings update`

Update your settings.

```bash
# Change language to Japanese
cryptact settings update --language ja

# Change language to English
cryptact settings update --language en
```

---

## Instruments (`instruments`)

### `instruments list`

List all supported crypto and fiat currencies.

```bash
cryptact instruments list
```

---

## User Account (`user`)

### `user info`

Display your account details.

```bash
cryptact user info
```

### `user referrals`

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

#### `mailing-list subscribe`

Update your email subscription preferences. Each category is a `--subscriptions.*` flag.

All four categories are required — send the complete object. Read the current values with
`cryptact mailing-list show --json` first; passing a subset returns 400.

```bash
cryptact mailing-list subscribe \
  --subscriptions.mandatory true --subscriptions.announcements true \
  --subscriptions.marketing false --subscriptions.transactional true
```

| Option                                    | Description                          |
| ----------------------------------------- | ------------------------------------ |
| `--subscriptions.mandatory <true\|false>`  | Mandatory service mail               |
| `--subscriptions.announcements <true\|false>` | Product announcements             |
| `--subscriptions.marketing <true\|false>` | Marketing mail                       |
| `--subscriptions.transactional <true\|false>` | Transactional mail               |

---

## Enum References (`reference`)

Discover the valid values for enum-typed flags. Option help text points here
(e.g. `see: cryptact reference show timezone`).

### `reference list`

List every enum reference name known to the CLI.

```bash
cryptact reference list
```

### `reference show`

Print every valid value for a named enum reference.

```bash
cryptact reference show timezone
cryptact reference show cost-basis-method
```
