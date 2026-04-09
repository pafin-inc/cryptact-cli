// @generated — do not edit by hand.

export interface OptionDef {
  flags: string;
  description: string;
  required?: boolean;
}

export interface ArgumentDef {
  name: string;
  description: string;
  required?: boolean;
}

export interface CommandDef {
  name: string;
  description: string;
  handler: string;
  needsLedger?: boolean;
  options?: OptionDef[];
  arguments?: ArgumentDef[];
}

export interface GroupDef {
  name: string;
  description: string;
  commands: CommandDef[];
}

// ---------------------------------------------------------------------------
// Constants (from @cryptact/dashboard-common)
// ---------------------------------------------------------------------------

/** Sentinel value for masked/hidden display values */
export const Z3 = "000.000";

// ---------------------------------------------------------------------------
// Generated option interfaces
// ---------------------------------------------------------------------------

export interface LedgerReprocessOptions {
  forceRebuild?: boolean;
  from?: string;
}

export interface LedgerDownloadOptions {
  year?: string;
}

export interface LedgerUpdateOptions {
  reportingCcy?: string;
  costBasisMethod?: string;
  fxCostBasisMethod?: string;
  timezone?: string;
  fiscalYearEndMonth?: string;
  defiTranslator?: string;
  positionDecimalPlaces?: string;
  allowMarginalFlip?: boolean;
  marginalFlipThreshold?: string;
  alwaysUseTtm?: boolean;
  corporateM2mMethod?: string;
  priceLookupFallbackToZero?: boolean;
  sendFeeExpensed?: boolean;
  adjustedCostBasisFromFy?: string;
  importAssetMovements?: boolean;
}

export interface TransactionSearchOptions {
  source?: string;
  action?: string;
  feeCurrency?: string;
  pair?: string;
  from?: string;
  to?: string;
  limit?: string;
  hasError?: boolean;
  offset?: string;
  order?: string;
}

export interface TransactionShowOptions {
  type?: string;
}

export interface TransactionEditOptions {
  action?: string;
  base?: string;
  counter?: string;
  feeCurrency?: string;
  volume?: string;
  price?: string;
  fee?: string;
  source?: string;
  comment?: string;
  timestamp?: string;
  rc?: string;
  realized?: string;
}

export interface TransactionExcludeOptions {
  undo?: boolean;
}

export interface ExchangeEndpointsOptions {
  exchange: string;
}

export interface ExchangeKeyAddOptions {
  exchange: string;
  publicKey: string;
  privateKey: string;
  passphrase?: string;
  subAccount?: string;
  endpoints: string;
}

export interface ExchangeKeyDeleteOptions {
  exchange: string;
  subAccount?: string;
}

export interface ExchangeKeyUpdateOptions {
  exchange: string;
  subAccount: string;
  endpoints: string;
}

export interface ExchangeSyncOptions {
  exchange: string;
  subAccount?: string;
  endpoint?: string;
}

export interface ExchangeSyncCancelOptions {
  exchange: string;
  subAccount?: string;
  endpoint?: string;
}

export interface ExchangeFileHistoryOptions {
  offset?: string;
}

export interface ExchangeFileUploadOptions {
  exchangeFileId: string;
  timezone?: string;
  subId?: string;
  password?: string;
}

export interface WalletAddOptions {
  chain: string;
  address: string;
  memo?: string;
}

export interface WalletDeleteOptions {
  chain: string;
  address: string;
}

export interface WalletUpdateOptions {
  chain: string;
  address: string;
  memo?: string;
}

export interface WalletAddMultiOptions {
  chains: string;
  address: string;
  memo?: string;
}

export interface WalletSyncOptions {
  exchange: string;
  subAccount?: string;
  endpoint?: string;
}

export interface WalletSyncCancelOptions {
  exchange: string;
  subAccount?: string;
  endpoint?: string;
}

export interface PortfolioShowOptions {
  reportingCcy?: string;
}

export interface PortfolioHistoryOptions {
  from?: string;
  to?: string;
}

export interface PortfolioCoinHistoryOptions {
  coin: string;
  from: string;
  to: string;
}

export interface BillingInvoicesOptions {
  limit?: string;
  endingBefore?: string;
  startingAfter?: string;
}

export interface SettingsUpdateOptions {
  language: string;
}

export interface DefiSearchOptions {
  chains: string;
  quickFilter?: string;
  limit?: string;
  startTime?: string;
  endTime?: string;
  sortOrder?: string;
  chainFamily?: string;
  addresses?: string;
  services?: string;
  actionDetail?: string;
  assetHashes?: string;
  page?: string;
}

export interface DefiEditOptions {
  chain: string;
  txHash: string;
  action: string;
  transferType?: string;
}

export interface DefiDeleteEditOptions {
  chain: string;
  txHash: string;
}

export interface DefiEditsOptions {
  chains: string;
}

export interface DefiAcceptAllOptions {
  startTime?: string;
  endTime?: string;
  chainFamily?: string;
}

export interface DefiMarkRiskyOptions {
  action: string;
  startTime?: string;
  endTime?: string;
  chainFamily?: string;
}

export interface DefiMarkTransfersSelfOptions {
  startTime?: string;
  chainFamily?: string;
}

export interface DefiStatsOptions {
  startTime?: string;
  chainFamily?: string;
}

export interface LiveViewPositionOptions {
  reportingCcy: string;
  snapshotTimestamp?: string;
  exchanges: string;
}

// ---------------------------------------------------------------------------
// Generated response types (from @cryptact/dashboard-common Receive types)
// ---------------------------------------------------------------------------

export interface ILedgerCostBasisOptions {
  handleWashSales: boolean;
  splitPlByStLt: boolean;
}

export interface ILedger {
  ledgerId: string;
  allowMarginalFlip: boolean;
  alwaysUseTTM: boolean;
  corporateMarkToMarketMethod: null | "reversal" | "cutoff";
  costBasisMethod: "FIFO" | "LIFO" | "HIFO" | "Average Cost" | "Periodic Average";
  costBasisOptions: ILedgerCostBasisOptions;
  defiTranslator: "CONFIRM" | "DIFFERENTIAL";
  fiscalYearEndMonth: 2 | 5 | 1 | 3 | 4 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 45;
  fxCostBasisMethod: "FIFO" | "LIFO" | "HIFO" | "Average Cost" | "Periodic Average";
  marginalFlipThreshold: number;
  positionDecimalPlaces: number;
  priceLookupFallbackToZero: boolean;
  reportingCcy:
    | "AUD"
    | "BRL"
    | "CAD"
    | "CHF"
    | "EUR"
    | "GBP"
    | "HKD"
    | "INR"
    | "JPY"
    | "KRW"
    | "NZD"
    | "SGD"
    | "TRY"
    | "TWD"
    | "USD";
  sendFeeExpensed: boolean;
  timezone: string;
  useAdjustedCostBasisFromFiscalYear: null | number;
  lockingFiscalYear: null | number;
  onboardingStatus:
    | null
    | "ledger-settings"
    | "starting-balance"
    | "completed-assistant"
    | "completed-balance";
  resetUnlockedSnapshot: boolean;
  hasRestrictedActionAccess: boolean;
  importAssetMovements: boolean;
}

export interface LedgerShowResponse {
  ledger: ILedger;
}

export interface CttError {
  code: string;
  name: "CttError";
  params?: Record<string, string | number | false | true>;
  message: string;
  stack?: string;
  cause?: unknown;
}

export interface IProcessStatus {
  error: null | CttError;
  ledgerId: string;
  processId: null | number;
  state:
    | "PREPARING"
    | "QUEUED_PROCESS"
    | "QUEUED_UPLOAD"
    | "RUNNING"
    | "UPLOADING"
    | "DOWNLOADING"
    | "QUEUED_DOWNLOAD"
    | "DONE"
    | "ERROR"
    | "TIMEOUT"
    | "UNSTARTED";
  ts: number;
  lastUpdateTs: null | number;
}

export interface LedgerStatusResponse {
  processStatus: IProcessStatus;
}

export interface LedgerReprocessResponse {
  processStatus: IProcessStatus;
}

export interface LedgerDownloadPreviewResponseDownloadFile {
  id:
    | "cryptact-ledger"
    | "cryptact-transactions"
    | "cryptact-annual"
    | "cryptact-exchange"
    | "cryptact-summary"
    | "cryptact-start-of-year"
    | "cryptact-custom-import"
    | "DeFi-CONFIRM-upload"
    | "cryptact-kasou-todoke"
    | "cryptact-annual-summary-[CA]"
    | "cryptact-india-capital-gains-summary"
    | "cryptact-india-derivatives-summary"
    | "cryptact-annual-summary-[IN]"
    | "defi-special-activity-report";
  type: "pdf" | "csv" | "xlsx";
  requiredForTaxReturnInCountry?: string;
}

export interface LedgerDownloadPreviewResponse {
  downloadFiles: LedgerDownloadPreviewResponseDownloadFile[];
}

export interface LedgerDownloadResponse {
  ledgerId: string;
}

export interface LedgerUpdateResponse {
  ledger: ILedger;
}

export interface ITransactionCount {
  generated: number;
  grouped: number;
  ungrouped: number;
}

export interface LTDInstrumentSummaryAsPl {
  total: string;
  wash: string;
  short: string;
  long: string;
}

export interface CryptoInstrument {
  instrumentId: string;
  instrumentType: "crypto";
}

export interface DerivativeInstrument {
  instrumentId: string;
  instrumentType: "derivative";
}

export interface FiatInstrument {
  instrumentId: string;
  instrumentType: "fiat";
}

export interface UnsupportedInstrument {
  instrumentId: string;
  instrumentType: "unsupported";
}

export interface LTDInstrumentSummaryAs {
  count: ITransactionCount;
  pl: LTDInstrumentSummaryAsPl;
  instrument: CryptoInstrument | DerivativeInstrument | FiatInstrument | UnsupportedInstrument;
  position: string;
  weightedCost: string;
  totalCorporatePL?: null | string;
  totalCost: string;
  totalRevenue: string;
}

export interface LedgerSummaryResponseSummaryByInstrumentTotalPl {
  total: string;
  wash: string;
  short: string;
  long: string;
}

export interface LedgerSummaryResponseSummaryByInstrumentTotal {
  pl: LedgerSummaryResponseSummaryByInstrumentTotalPl;
  count: ITransactionCount;
  totalCorporatePL?: null | string;
}

export interface LedgerSummaryResponseSummaryByInstrument {
  summaryType: "ltd-instrument";
  summaries: LTDInstrumentSummaryAs[];
  total: LedgerSummaryResponseSummaryByInstrumentTotal;
}

export interface ExchangeSummaryAsPl {
  total: string;
  wash: string;
  short: string;
  long: string;
}

export interface ExchangeSummaryAsExchangeId {
  exchangeType: "listed";
  exchangeId: string;
}

export interface ExchangeSummaryAs {
  count: ITransactionCount;
  pl: ExchangeSummaryAsPl;
  exchangeId: ExchangeSummaryAsExchangeId;
  totalCost: string;
  totalRevenue: string;
  fees: string;
  valueTraded: string;
}

export interface LedgerSummaryResponseSummaryByYearExchangeTotalPl {
  total: string;
  wash: string;
  short: string;
  long: string;
}

export interface LedgerSummaryResponseSummaryByYearExchangeTotal {
  pl: LedgerSummaryResponseSummaryByYearExchangeTotalPl;
}

export interface LedgerSummaryResponseSummaryByYearExchange {
  summaryType: "yearly-exchange";
  summaries: ExchangeSummaryAs[];
  customSummary?: ExchangeSummaryAs;
  fiscalYear: number;
  total: LedgerSummaryResponseSummaryByYearExchangeTotal;
}

export interface InstrumentSummaryAsPl {
  total: string;
  wash: string;
  short: string;
  long: string;
}

export interface InstrumentSummaryAs {
  count: ITransactionCount;
  pl: InstrumentSummaryAsPl;
  instrument: CryptoInstrument | DerivativeInstrument | FiatInstrument | UnsupportedInstrument;
  position: string;
  price: null | string;
  totalCorporatePL?: null | string;
  totalCost: string;
  totalRevenue: string;
  unrealizedPL: null | string;
  weightedCost: string;
}

export interface LedgerSummaryResponseSummaryByYearInstrumentTotalPl {
  total: string;
  wash: string;
  short: string;
  long: string;
}

export interface LedgerSummaryResponseSummaryByYearInstrumentTotal {
  pl: LedgerSummaryResponseSummaryByYearInstrumentTotalPl;
  count: ITransactionCount;
  totalCorporatePL?: null | string;
  unrealizedPL?: null | string;
}

export interface LedgerSummaryResponseSummaryByYearInstrument {
  summaryType: "yearly-instrument";
  summaries: InstrumentSummaryAs[];
  fiscalYear: number;
  total: LedgerSummaryResponseSummaryByYearInstrumentTotal;
}

export interface LedgerSummaryResponseSummaryByYearLoanSummaryLoanBorrowCounterparty {
  name: string;
  volume: string;
}

export interface LedgerSummaryResponseSummaryByYearLoanSummaryLoanBorrow {
  totalVolume: string;
  counterparties: LedgerSummaryResponseSummaryByYearLoanSummaryLoanBorrowCounterparty[];
}

export interface LedgerSummaryResponseSummaryByYearLoanSummaryLoanLendCounterparty {
  name: string;
  volume: string;
}

export interface LedgerSummaryResponseSummaryByYearLoanSummaryLoanLend {
  totalVolume: string;
  counterparties: LedgerSummaryResponseSummaryByYearLoanSummaryLoanLendCounterparty[];
}

export interface LedgerSummaryResponseSummaryByYearLoanSummaryLoan {
  borrow: LedgerSummaryResponseSummaryByYearLoanSummaryLoanBorrow;
  lend: LedgerSummaryResponseSummaryByYearLoanSummaryLoanLend;
  netVolume: string;
}

export interface LedgerSummaryResponseSummaryByYearLoanSummary {
  instrument: CryptoInstrument | DerivativeInstrument | FiatInstrument | UnsupportedInstrument;
  loan: LedgerSummaryResponseSummaryByYearLoanSummaryLoan;
}

export interface LedgerSummaryResponseSummaryByYearLoan {
  fiscalYear: number;
  summaryType: "yearly-loan";
  summaries: LedgerSummaryResponseSummaryByYearLoanSummary[];
}

export interface LedgerSummaryResponseSummaryByYearBalanceSummaryBalance {
  wallet: string;
  balance: string;
}

export interface LedgerSummaryResponseSummaryByYearBalanceSummary {
  instrument: CryptoInstrument | DerivativeInstrument | FiatInstrument | UnsupportedInstrument;
  balances: LedgerSummaryResponseSummaryByYearBalanceSummaryBalance[];
}

export interface LedgerSummaryResponseSummaryByYearBalance {
  fiscalYear: number;
  summaryType: "yearly-balance";
  summaries: LedgerSummaryResponseSummaryByYearBalanceSummary[];
}

export interface LedgerSummaryResponseSummaryFeedbackCodes {
  "error.bprc-exceeds-limit"?: number;
  "error.cprc-exceeds-limit"?: number;
  "error.fprc-exceeds-limit"?: number;
  "error.counterparty-mismatch-recover"?: number;
  "error.counterparty-mismatch-return"?: number;
  "error.lend-exceeds-lendable"?: number;
  "error.no-price-available"?: number;
  "error.over-sell"?: number;
  "error.price-lookup-on-fiat-transaction"?: number;
  "error.return-exceeds-returnable"?: number;
  "error.sell-exceeds-sellable"?: number;
  "error.unsupported-base-ccy"?: number;
  "error.unsupported-counter-ccy"?: number;
  "error.unsupported-fee-ccy"?: number;
  "error.firc-exceeds-limit"?: number;
  "error.zero-volume-level-up-txn"?: number;
  "error.level-up-with-no-position"?: number;
  "error.over-fee"?: number;
  "info.defi-modified-txn"?: number;
  "info.flip-txn"?: number;
  "info.modified-txn"?: number;
  "info.pre-2021-tip-txn"?: number;
  "info.wash-sale"?: number;
  "info.defi-convert-txn"?: number;
  "info.special-unsupported"?: number;
  "info.electronic-payment-method-pnl"?: number;
  "info.manually-excluded-txn"?: number;
  "info.defi-excluded-txn"?: number;
  "info.alt-fee-generated-txn"?: number;
  "info.auto-generated-loan-fee"?: number;
  "info.auto-generated-txn"?: number;
  "info.send-fee-generated-txn"?: number;
  "info.auto-generated-margin-fee"?: number;
  "info.auto-generated-epm-fee"?: number;
  "warning.high-fee-percentage"?: number;
  "warning.marginal-close-adjustment"?: number;
  "warning.marginal-lend-adjustment"?: number;
  "warning.marginal-recover-close-adjustment"?: number;
  "warning.marginal-return-close-adjustment"?: number;
  "warning.price-lookup-fallback-to-zero"?: number;
  "warning.transaction-flipped"?: number;
  "warning.unknown-defi-coin"?: number;
  "warning.zero-volume-txn"?: number;
  "warning.adjusted-cost-basis-applied"?: number;
  "warning.loss-with-non-zero-price"?: number;
  "warning.legacy-sendfee-issue"?: number;
  "warning.fee-rebate-close-adjustment"?: number;
}

export interface LedgerSummaryResponseSummary {
  actions: string[];
  byInstrument: LedgerSummaryResponseSummaryByInstrument;
  byYearExchange: LedgerSummaryResponseSummaryByYearExchange[];
  byYearInstrument: LedgerSummaryResponseSummaryByYearInstrument[];
  byYearLoan: LedgerSummaryResponseSummaryByYearLoan[];
  byYearBalance: LedgerSummaryResponseSummaryByYearBalance[];
  feeCurrencies: string[];
  feedbackCodes: LedgerSummaryResponseSummaryFeedbackCodes;
  pairs: string[];
  sources: string[];
  transactionCount: ITransactionCount;
}

export interface LedgerSummaryResponse {
  ledgerId: string;
  summary: LedgerSummaryResponseSummary;
}

export interface TransactionSearchResponseFilterOrderBy {
  column: "ts" | "processOrder";
  order: "ASC" | "DESC";
}

export interface TransactionSearchResponseFilter {
  action: string[];
  feeCurrency: string[];
  from: null | string;
  ledgerId: null | string;
  orderBy: TransactionSearchResponseFilterOrderBy[];
  pair: string[];
  source: string[];
  to: null | string;
  feedbackNumericCode?: number[];
  fromProcessOrder?: null | number;
  hasError?: boolean;
  limit?: null | number;
  toProcessOrder?: null | number;
}

export interface ExtendedTransactionFeedbackParams {
  pair: string;
}

export interface ExtendedTransactionFeedback {
  params: ExtendedTransactionFeedbackParams;
  code: "error.bprc-exceeds-limit";
}

export interface BaseTransactionFeedback {
  code: "error.firc-exceeds-limit";
  params?: Record<string, unknown>;
}

export interface ITransactionAsPl {
  total: string;
  wash: string;
  short: string;
  long: string;
}

export interface ITransactionAs {
  act: string;
  bPAT: string;
  bPRC: string;
  bWCT: string;
  bc: string;
  cPAT: string;
  cPRC: string;
  cWCT: string;
  cc: string;
  comment: null | string;
  creationTimestamp: null | string;
  dd: null | string;
  dt: null | "fx" | "future" | "bitmex" | "margin" | "option" | "psd-future" | "cfd";
  efi: string;
  externalTxnId: null | string;
  fIRC: string;
  fPRC: string;
  fPct: string;
  fc: string;
  fee: string;
  feedback: (ExtendedTransactionFeedback | BaseTransactionFeedback)[];
  feedbackNumericCode: null | number[];
  pair: string;
  parent: null | string;
  pl: ITransactionAsPl;
  prc: string;
  processOrder: number;
  src: string;
  subId: null | string;
  ts: string;
  ungroupedCount: number;
  uuid: string;
  vol: string;
}

export interface TransactionSearchResponse {
  filter: TransactionSearchResponseFilter;
  offset?: number;
  results: ITransactionAs[];
  total: number;
}

export interface TransactionShowResponse {
  ledgerId: string;
  transactionType: "unprocessed" | "processed";
  detail: ITransactionAs;
  transactionId: string;
}

export interface TransactionEditResponse {
  ledgerId: string;
  transactionId: string;
}

export interface TransactionDeleteResponseDeletedCount {
  generated: number;
  grouped: number;
  ungrouped: number;
}

export interface TransactionDeleteResponse {
  deletedCount: TransactionDeleteResponseDeletedCount;
}

export interface TransactionExcludeResponse {
  excludeOrUnexclude: "exclude" | "unexclude";
  ledgerId: string;
  transactionId: string;
}

export interface TransactionSummaryResponseSummary {
  instrument: CryptoInstrument | DerivativeInstrument | FiatInstrument | UnsupportedInstrument;
  chg: string;
  position: string;
}

export interface TransactionSummaryResponse {
  ledgerId: string;
  transactionId: string;
  summaryType: "transaction";
  summaries: TransactionSummaryResponseSummary[];
}

export interface TransactionLoanSummaryResponseLoanLoans {
  borrowed: string;
  lent: string;
}

export interface TransactionLoanSummaryResponseLoan {
  instrument: CryptoInstrument | DerivativeInstrument | FiatInstrument | UnsupportedInstrument;
  loans: TransactionLoanSummaryResponseLoanLoans;
}

export interface TransactionLoanSummaryResponse {
  ledgerId: string;
  transactionId: string;
  loans: TransactionLoanSummaryResponseLoan[];
}

export interface TransactionOpenCloseResponseOpenClose {
  txnUuid: string;
  ccy: string;
  ts: string;
  side: "BUY/CLOSE" | "BUY/OPEN" | "BUY/OPEN/WASH" | "SELL/CLOSE" | "SELL/OPEN" | "SELL/OPEN/WASH";
  vol: string;
  prc: string;
  fee: string;
  cb: string;
}

export interface TransactionOpenCloseResponse {
  ledgerId: string;
  openClose: TransactionOpenCloseResponseOpenClose[];
  transactionId: string;
}

export interface TransactionBalanceSummaryResponseBalanceChange {
  type: "fee" | "transfer" | "trade";
  instrument: CryptoInstrument | DerivativeInstrument | FiatInstrument | UnsupportedInstrument;
  wallet: string;
  change: string;
  changeInRc: string;
  balance: string;
}

export interface TransactionBalanceSummaryResponseBalance {
  summaryType: "balance";
  changes: TransactionBalanceSummaryResponseBalanceChange[];
}

export interface TransactionBalanceSummaryResponse {
  ledgerId: string;
  transactionId: string;
  balance: TransactionBalanceSummaryResponseBalance;
}

export interface ExchangeKeysResponseKeyInfoEndpoint {
  endpoint: string;
  startTimestampMs: number;
  isFromFiles: boolean;
}

export interface ExchangeKeysResponseKeyInfo {
  createdAt: number;
  endpoints: ExchangeKeysResponseKeyInfoEndpoint[];
  exchange: string;
  pubKey: string;
  subAccount: string;
  updatedAt: number;
}

export interface ExchangeKeysResponse {
  keyInfos?: null | ExchangeKeysResponseKeyInfo[];
}

export interface ExchangeEndpointsResponseEndpoint {
  endpoint: string;
  addedAt: number;
}

export interface ExchangeEndpointsResponse {
  endpoints: ExchangeEndpointsResponseEndpoint[];
}

export interface ExchangeKeyUpdateResponseEndpoint {
  endpoint: string;
  startTimestampMs: number;
  isFromFiles: boolean;
}

export interface ExchangeKeyUpdateResponse {
  endpoints: ExchangeKeyUpdateResponseEndpoint[];
}

export interface WalletSyncStatusResponseStatus {
  details: string;
  endpoint: string;
  errorCode:
    | 0
    | 1
    | 2
    | 3
    | 4
    | 100
    | 101
    | 102
    | 200
    | 201
    | 202
    | 203
    | 204
    | 205
    | 206
    | 207
    | 208
    | 300
    | 301
    | 302
    | 303
    | 400
    | 401
    | 402
    | 403
    | 404
    | 405
    | 900;
  exchange: string;
  status: "DONE" | "ERROR" | "CANCELLED" | "NOT_SYNCED" | "PROCESSING" | "STARTING";
  subAccount: string;
  timestamp: number;
  jobBatchId?: number;
  progress?: number;
}

export interface WalletSyncStatusResponse {
  statuses?: null | WalletSyncStatusResponseStatus[];
}

export interface ExchangeProcessingStatusResponse {
  processingStatus: "good" | "busy" | "degraded";
}

export interface ExchangeFileHistoryResponseFilter {
  fileId?: number;
  ledgerId?: string;
  exchangeFileIds?: string[];
  state?: "DONE" | "ERROR" | "QUEUED" | "STARTED";
}

export interface ExchangeFileDetails {
  appendSkipCount: number;
  ignoreCount: number;
  appendSkipType?: "efi" | "lock";
  appendSkipTs?: string;
  confirmCount?: number;
  transactionCountByYear: Record<string, ITransactionCount>;
}

export interface IExchangeFileHistory {
  fileId: number;
  error: null | CttError;
  exchangeFileId: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  ledgerId: string;
  state: "DONE" | "ERROR" | "QUEUED" | "STARTED";
  subId: null | string;
  timestamp: string;
  details?: ExchangeFileDetails;
}

export interface ExchangeFileHistoryResponse {
  filter: ExchangeFileHistoryResponseFilter;
  offset?: number;
  results: IExchangeFileHistory[];
  total: number;
}

export interface ExchangeFileDetailsResponse {
  fileId: number;
  error: null | CttError;
  exchangeFileId: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  ledgerId: string;
  state: "DONE" | "ERROR" | "QUEUED" | "STARTED";
  subId: null | string;
  timestamp: string;
  details?: ExchangeFileDetails;
}

export interface WalletListResponseAddress {
  address: string;
  chain: string;
  createdAt: number;
  updatedAt: number;
  memo?: string;
}

export interface WalletListResponse {
  addresses?: null | WalletListResponseAddress[];
}

export interface PortfolioShowResponseDetailCoinChange {
  daily: null | number;
  hourly: null | number;
  weekly: null | number;
}

export interface PortfolioShowResponseDetailCoin {
  averageCost: string;
  change: PortfolioShowResponseDetailCoinChange;
  coin: string;
  costBasisMethod: "FIFO" | "LIFO" | "HIFO" | "Average Cost" | "Periodic Average";
  mv: string;
  position: string;
  price: null | string;
  reportingCcy:
    | "AUD"
    | "BRL"
    | "CAD"
    | "CHF"
    | "EUR"
    | "GBP"
    | "HKD"
    | "INR"
    | "JPY"
    | "KRW"
    | "NZD"
    | "SGD"
    | "TRY"
    | "TWD"
    | "USD";
  unrealizedGains: string;
  updatedTimestamp: null | string;
}

export interface PortfolioShowResponseDetailNft {
  defiToken: string;
}

export interface PortfolioShowResponseDetailByEx {
  exchange: string;
  feePct: number;
  fees: string;
  reportingCcy:
    | "AUD"
    | "BRL"
    | "CAD"
    | "CHF"
    | "EUR"
    | "GBP"
    | "HKD"
    | "INR"
    | "JPY"
    | "KRW"
    | "NZD"
    | "SGD"
    | "TRY"
    | "TWD"
    | "USD";
  valueTraded: string;
}

export interface PortfolioShowResponseDetail {
  coins: PortfolioShowResponseDetailCoin[];
  nfts: PortfolioShowResponseDetailNft[];
  byEx: PortfolioShowResponseDetailByEx[];
}

export interface PortfolioShowResponse {
  ledgerId: string;
  reportingCcy:
    | "AUD"
    | "BRL"
    | "CAD"
    | "CHF"
    | "EUR"
    | "GBP"
    | "HKD"
    | "INR"
    | "JPY"
    | "KRW"
    | "NZD"
    | "SGD"
    | "TRY"
    | "TWD"
    | "USD";
  detail: PortfolioShowResponseDetail;
}

export interface IDetailedAggregate {
  ledgerId: number;
  instrumentId: string;
  source: string;
  action: string;
  hour: string;
  increased: string;
  decreased: string;
}

export interface IGlobalPnlAggregate {
  ledgerId: number;
  hour: string;
  pnl: string;
}

export interface IDetailedPnlAggregate {
  ledgerId: number;
  source: string;
  action: string;
  hour: string;
  pnl: string;
}

export interface PortfolioHistoryResponse {
  status: "RUNNING" | "DONE" | "ERROR" | "QUEUED" | "INITIAL" | "RUNNING_INVALIDATED";
  aggregates: IDetailedAggregate[] | IGlobalPnlAggregate[] | IDetailedPnlAggregate[];
  previousAggregate?: undefined;
}

export interface IGlobalAggregate {
  ledgerId: number;
  instrumentId: string;
  hour: string;
  position: string;
  increased: string;
  decreased: string;
}

export interface PortfolioCoinHistoryResponse {
  status: "RUNNING" | "DONE" | "ERROR" | "QUEUED" | "INITIAL" | "RUNNING_INVALIDATED";
  aggregates: IGlobalAggregate[];
  previousAggregate?: null | IGlobalAggregate;
}

export interface StripeInvoiceLineItemPeriod {
  end: number;
  start: number;
}

export interface StripeInvoiceLineItem {
  amount: number;
  description: null | string;
  period: StripeInvoiceLineItemPeriod;
  tier:
    | null
    | "LedgerPlanFree"
    | "LedgerPlanEntry"
    | "LedgerPlanLight"
    | "LedgerPlanStandard"
    | "LedgerPlanAdvanced"
    | "LedgerPlanPremium"
    | "LedgerPlanVip"
    | "LedgerPlanEnterprise"
    | "LedgerPlanFreeInternational"
    | "LedgerPlanBasic"
    | "LedgerPlanPrime"
    | "LedgerPlanPro"
    | "LedgerPlanProPlus"
    | "LedgerPlanProUnlimited"
    | "LedgerPlanDataRetention"
    | "LedgerPlanIndiaExclusive"
    | "LedgerPlanTrial"
    | "LedgerPlanPremium2M"
    | "LedgerPlanPremium3M"
    | "LedgerPlanPremium5M"
    | "LedgerPlanPremium10M"
    | "LedgerPlanPremium20M";
  type: "unknown" | "new-purchase" | "unused-time";
}

export interface StripePaymentIntent {
  amount: number;
  clientSecret: null | string;
  currency: "jpy" | "inr" | "usd";
  id: string;
  paymentMethod: null | string;
  status:
    | "canceled"
    | "processing"
    | "requires_action"
    | "requires_capture"
    | "requires_confirmation"
    | "requires_payment_method"
    | "succeeded";
}

export interface StripeInvoicePaymentMethod {
  brand: string;
  last4: string;
}

export interface StripeInvoiceBankTransferDetails {
  bankCode: string;
  bankName: string;
  branchCode: string;
  branchName: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
}

export interface StripeInvoice {
  amountDue: number;
  created: number;
  currency: "jpy" | "inr" | "usd";
  discount: null | unknown;
  dueDate: null | number;
  endingBalance: null | number;
  id: string;
  invoicePDF: undefined | null | string;
  lines: StripeInvoiceLineItem[];
  nextPaymentAttempt: null | number;
  number: null | string;
  paidAt: null | number;
  paymentIntent: null | StripePaymentIntent;
  paymentMethod?: StripeInvoicePaymentMethod;
  paymentMethodTypes:
    | null
    | (
        | "link"
        | "ach_credit_transfer"
        | "ach_debit"
        | "acss_debit"
        | "au_becs_debit"
        | "bacs_debit"
        | "bancontact"
        | "boleto"
        | "card"
        | "cashapp"
        | "customer_balance"
        | "fpx"
        | "giropay"
        | "grabpay"
        | "ideal"
        | "konbini"
        | "paynow"
        | "paypal"
        | "promptpay"
        | "sepa_credit_transfer"
        | "sepa_debit"
        | "sofort"
        | "us_bank_account"
        | "wechat_pay"
      )[];
  periodEnd: number;
  periodStart: number;
  postPaymentCreditNotesAmount: number;
  receiptUrl: null | string;
  startingBalance: number;
  status: null | "void" | "draft" | "open" | "paid" | "uncollectible";
  subtotal: number;
  tax: null | number;
  total: number;
  totalDiscountAmounts: null | unknown[];
  totalTaxAmounts: unknown[];
  bitpayInvoiceUrl?: string;
  bitpayStatus?: "paid" | "complete" | "confirmed" | "expired" | "invalid" | "new";
  customPaymentMethod?: "bankTransfer" | "bitpay";
  bankTransferDetails?: StripeInvoiceBankTransferDetails;
  dismissAutoRenewalOffWarning: boolean;
}

export interface StripePlan {
  active: boolean;
  amount: number;
  billingTier:
    | "LedgerPlanFree"
    | "LedgerPlanEntry"
    | "LedgerPlanLight"
    | "LedgerPlanStandard"
    | "LedgerPlanAdvanced"
    | "LedgerPlanPremium"
    | "LedgerPlanVip"
    | "LedgerPlanEnterprise"
    | "LedgerPlanFreeInternational"
    | "LedgerPlanBasic"
    | "LedgerPlanPrime"
    | "LedgerPlanPro"
    | "LedgerPlanProPlus"
    | "LedgerPlanProUnlimited"
    | "LedgerPlanDataRetention"
    | "LedgerPlanIndiaExclusive"
    | "LedgerPlanTrial"
    | "LedgerPlanPremium2M"
    | "LedgerPlanPremium3M"
    | "LedgerPlanPremium5M"
    | "LedgerPlanPremium10M"
    | "LedgerPlanPremium20M";
  currency: "jpy" | "inr" | "usd";
  id: string;
  isPurchasable?: boolean;
}

export interface UpcomingInvoiceParams {
  discounts?: null | "" | unknown[];
  subscription: string;
  subscription_items: unknown[];
  subscription_billing_cycle_anchor: number | "now" | "unchanged";
  subscription_default_tax_rates: null | "" | string[];
  subscription_proration_behavior: "always_invoice" | "create_prorations" | "none";
  subscription_proration_date: number;
}

export interface StripeSubscriptionBankTransferDetails {
  bankCode: string;
  bankName: string;
  branchCode: string;
  branchName: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
}

export interface StripeSubscription {
  cancelAt: null | number;
  cancelAtPeriodEnd: boolean;
  collectionMethod: "charge_automatically" | "send_invoice";
  currentPeriodEnd: number;
  currentPeriodStart: number;
  id: string;
  latestInvoice: null | StripeInvoice;
  plan: StripePlan;
  schedule: null | string;
  status:
    | "canceled"
    | "active"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "paused"
    | "trialing"
    | "unpaid";
  upcomingInvoiceParams?: UpcomingInvoiceParams;
  previousBillingTier?:
    | "LedgerPlanFree"
    | "LedgerPlanEntry"
    | "LedgerPlanLight"
    | "LedgerPlanStandard"
    | "LedgerPlanAdvanced"
    | "LedgerPlanPremium"
    | "LedgerPlanVip"
    | "LedgerPlanEnterprise"
    | "LedgerPlanFreeInternational"
    | "LedgerPlanBasic"
    | "LedgerPlanPrime"
    | "LedgerPlanPro"
    | "LedgerPlanProPlus"
    | "LedgerPlanProUnlimited"
    | "LedgerPlanDataRetention"
    | "LedgerPlanIndiaExclusive"
    | "LedgerPlanTrial"
    | "LedgerPlanPremium2M"
    | "LedgerPlanPremium3M"
    | "LedgerPlanPremium5M"
    | "LedgerPlanPremium10M"
    | "LedgerPlanPremium20M";
  bitpayInvoiceUrl?: string;
  bitpayStatus?: "paid" | "complete" | "confirmed" | "expired" | "invalid" | "new";
  customPaymentMethod?: "bankTransfer" | "bitpay";
  bankTransferDetails?: StripeSubscriptionBankTransferDetails;
  dismissAutoRenewalOffWarning: boolean;
}

export interface BillingPlanResponse {
  autoRenewalEpoch?: null | string;
  signedUpCountryCode: string;
  subscription: null | StripeSubscription;
}

export interface BillingPlansResponse {
  plans: StripePlan[];
}

export interface BillingInvoicesResponse {
  hasMore: boolean;
  list: StripeInvoice[];
}

export interface SettingsShowResponse {
  email: string;
  language: "en" | "ja";
}

export interface SettingsUpdateResponse {
  language: "en" | "ja";
}

export interface MailingListShowResponseSubscriptions {
  mandatory: boolean;
  announcements: boolean;
  marketing: boolean;
  transactional: boolean;
}

export interface MailingListShowResponse {
  subscriptions: MailingListShowResponseSubscriptions;
}

export interface DefiEditResponseUserEdit {
  ledgerId: string;
  chain: string;
  transactionHash: string;
  pendingAction?: string;
  pendingTransferType?: string;
  appliedAction?: string;
  appliedTransferType?: string;
}

export interface DefiEditResponse {
  userEdits: DefiEditResponseUserEdit[];
}

export interface DefiEditsResponse {
  userEdits: Record<
    string,
    "PENDING_APPLICATION" | "APPLIED" | "PENDING_REMOVAL" | "PENDING_UPDATE"
  >;
}

export interface DefiStatsResponseConfirm {
  transfers: number;
  risky: number;
  unknown: number;
  others: number;
  all: number;
  classified: number;
  total: number;
}

export interface DefiStatsResponseAssetHashe {
  symbol: string;
  address: string;
  tokenName: string;
}

export interface DefiStatsResponse {
  chainFamily: "SOLANA" | "BITCOIN" | "SUI" | "EVM" | "COSMOS";
  chains: string[];
  confirm: DefiStatsResponseConfirm;
  services: string[];
  actionDetail: (
    | "ERROR"
    | "BONUS"
    | "BORROW"
    | "LOSS"
    | "PAY"
    | "RETURN"
    | "IGNORE"
    | "UNSUPPORTED"
    | "EXCHANGE_TRANSFER"
    | "APPROVE"
    | "SWAP"
    | "ADD_LIQUIDITY"
    | "REMOVE_LIQUIDITY"
    | "ENTER_LP_STAKING"
    | "LEAVE_LP_STAKING"
    | "ENTER_STAKING"
    | "LEAVE_STAKING"
    | "ENTER_LENDING"
    | "LEAVE_LENDING"
    | "WRAP"
    | "UNWRAP"
    | "HARVEST"
    | "FEEONLY"
    | "UNKNOWN"
    | "TRANSFER_CANCEL"
    | "TRANSFER_SELF"
    | "TRANSFER_IN"
    | "TRANSFER_OUT"
    | "UNABLE_TO_PROCESS"
    | "CONVERTED"
  )[];
  assetHashes: DefiStatsResponseAssetHashe[];
  addresses: string[];
  methods: string[];
}

export interface LiveViewPositionResponseByCoinPosition {
  amount: string;
  asset: string;
  exchange: string;
  marketValue: null | string;
  price: null | string;
  subAccount: null | string;
  wallet: string;
}

export interface LiveViewPositionResponseByCoin {
  coin: string;
  positions: LiveViewPositionResponseByCoinPosition[];
}

export interface LiveViewPositionResponseByExchangePosition {
  amount: string;
  asset: string;
  exchange: string;
  marketValue: null | string;
  price: null | string;
  subAccount: null | string;
  wallet: string;
}

export interface LiveViewPositionResponseByExchange {
  exchange: string;
  positions: LiveViewPositionResponseByExchangePosition[];
}

export interface LiveViewPositionResponse {
  byCoin: LiveViewPositionResponseByCoin[];
  byExchange: LiveViewPositionResponseByExchange[];
}

export interface LiveViewSnapshotsResponse {
  timestamps: number[];
}

export interface LiveViewSettingsResponse {
  isPositionSnapshotEnabled: boolean;
}

export interface InstrumentsListResponseCryptoNames {
  en: Record<string, string>;
  ja: Record<string, string>;
}

export interface InstrumentsListResponseFxNames {
  en: Record<string, string>;
  ja: Record<string, string>;
}

export interface InstrumentsListResponse {
  cryptoMarketCaps: Record<string, number>;
  cryptoNames: InstrumentsListResponseCryptoNames;
  cryptoTokenAddresses: Record<string, string[]>;
  fxNames: InstrumentsListResponseFxNames;
}

export interface UserInfoResponse {
  role: "Admin" | "Enterprise" | "System" | "Unverified" | "Verified";
  onboarded: boolean;
  adminPermissions?: string[];
}

export interface UserReferralsResponseReferralStats {
  subscribed: number;
  paid: number;
  balance: number;
  earned: number;
}

export interface UserReferralsResponse {
  referralCode: string;
  referralStats: UserReferralsResponseReferralStats;
}

export interface UserInfoReceive {
  role: "Admin" | "Enterprise" | "System" | "Unverified" | "Verified";
  onboarded: boolean;
  adminPermissions?: string[];
}

// ---------------------------------------------------------------------------
// Spec data
// ---------------------------------------------------------------------------

export const spec: GroupDef[] = [
  {
    name: "auth",
    description: "Authentication commands",
    commands: [
      {
        name: "login",
        description: "Log in to cryptact via browser (OAuth PKCE)",
        handler: "auth/login"
      },
      {
        name: "logout",
        description: "Clear stored authentication tokens",
        handler: "auth/logout"
      },
      {
        name: "status",
        description: "Show current authentication status",
        handler: "auth/status"
      }
    ]
  },
  {
    name: "ledger",
    description: "Ledger processing",
    commands: [
      {
        name: "show",
        description: "Display ledger settings",
        needsLedger: true,
        handler: "ledger/show"
      },
      {
        name: "status",
        description: "Show ledger processing status",
        needsLedger: true,
        handler: "ledger/status"
      },
      {
        name: "reprocess",
        description: "Trigger ledger processing and poll until done",
        needsLedger: true,
        options: [
          {
            flags: "--force-rebuild",
            description: "Force a full rebuild"
          },
          {
            flags: "--from <timestamp>",
            description: "Process from Unix timestamp in milliseconds"
          }
        ],
        handler: "ledger/reprocess"
      },
      {
        name: "download-preview",
        description: "List available download files",
        needsLedger: true,
        handler: "ledger/download-preview"
      },
      {
        name: "download",
        description: "Trigger report download (sent via email)",
        needsLedger: true,
        options: [
          {
            flags: "--year <year>",
            description: "Fiscal year"
          }
        ],
        handler: "ledger/download"
      },
      {
        name: "update",
        description: "Update ledger settings",
        needsLedger: true,
        options: [
          {
            flags: "--reporting-ccy <ccy>",
            description: "Set reporting currency"
          },
          {
            flags: "--cost-basis-method <method>",
            description:
              'Cost basis method (FIFO, LIFO, HIFO, "Average Cost", or "Periodic Average")'
          },
          {
            flags: "--fx-cost-basis-method <method>",
            description: "FX cost basis method (FIFO, LIFO, or HIFO)"
          },
          {
            flags: "--timezone <tz>",
            description: "Set timezone"
          },
          {
            flags: "--fiscal-year-end-month <month>",
            description: "Fiscal year end month, 1-12 (e.g. 12 for December)"
          },
          {
            flags: "--defi-translator <mode>",
            description: "Set DeFi translator (CONFIRM or DIFFERENTIAL)"
          },
          {
            flags: "--position-decimal-places <n>",
            description: "Position decimal places, 8-20 (default 8)"
          },
          {
            flags: "--allow-marginal-flip",
            description: "Enable marginal flip"
          },
          {
            flags: "--marginal-flip-threshold <n>",
            description: "Set marginal flip threshold"
          },
          {
            flags: "--always-use-ttm",
            description: "Always use TTM rates"
          },
          {
            flags: "--corporate-m2m-method <method>",
            description: "Set corporate mark-to-market method (reversal or cutoff)"
          },
          {
            flags: "--price-lookup-fallback-to-zero",
            description: "Fall back to zero for missing prices"
          },
          {
            flags: "--send-fee-expensed",
            description: "Expense send fees"
          },
          {
            flags: "--adjusted-cost-basis-from-fy <year>",
            description: "Use adjusted cost basis from fiscal year"
          },
          {
            flags: "--import-asset-movements",
            description: "Import asset movements"
          }
        ],
        handler: "ledger/update"
      },
      {
        name: "summary",
        description: "Show yearly tax P&L summary",
        needsLedger: true,
        handler: "ledger/summary"
      }
    ]
  },
  {
    name: "transaction",
    description: "Transaction management",
    commands: [
      {
        name: "search",
        description: "Search transactions",
        needsLedger: true,
        options: [
          {
            flags: "--source <source>",
            description: "Filter by source, comma-separated (e.g. binance,coinbase)"
          },
          {
            flags: "--action <action>",
            description: "Filter by action, comma-separated (e.g. BUY,SELL,MINING)"
          },
          {
            flags: "--fee-currency <fc>",
            description: "Filter by fee currency, comma-separated (e.g. JPY,BTC)"
          },
          {
            flags: "--pair <pair>",
            description: "Filter by pair, comma-separated (e.g. BTC/JPY,ETH/USD)"
          },
          {
            flags: "--from <date>",
            description: "From date (YYYY-MM-DD)"
          },
          {
            flags: "--to <date>",
            description: "To date (YYYY-MM-DD)"
          },
          {
            flags: "--limit <n>",
            description: "Max results"
          },
          {
            flags: "--has-error",
            description: "Show only transactions with errors"
          },
          {
            flags: "--offset <n>",
            description: "Pagination offset"
          },
          {
            flags: "--order <direction>",
            description: "Sort direction: ASC or DESC (default: DESC)"
          }
        ],
        handler: "transaction/search"
      },
      {
        name: "show",
        description: "Show a single transaction",
        needsLedger: true,
        arguments: [
          {
            name: "uuid",
            description: "Transaction UUID",
            required: true
          }
        ],
        options: [
          {
            flags: "--type <type>",
            description: "Transaction type: processed or unprocessed"
          }
        ],
        handler: "transaction/show"
      },
      {
        name: "edit",
        description: "Edit a transaction",
        needsLedger: true,
        arguments: [
          {
            name: "uuid",
            description: "Transaction UUID",
            required: true
          }
        ],
        options: [
          {
            flags: "--action <action>",
            description: "Set action"
          },
          {
            flags: "--base <base>",
            description: "Set base currency"
          },
          {
            flags: "--counter <counter>",
            description: "Set counter currency"
          },
          {
            flags: "--fee-currency <fc>",
            description: "Set fee currency"
          },
          {
            flags: "--volume <volume>",
            description: "Set volume"
          },
          {
            flags: "--price <price>",
            description: "Set price"
          },
          {
            flags: "--fee <fee>",
            description: "Set fee"
          },
          {
            flags: "--source <source>",
            description: "Set source"
          },
          {
            flags: "--comment <comment>",
            description: "Set comment (use empty string to clear)"
          },
          {
            flags: "--timestamp <ts>",
            description: "Set timestamp (ISO 8601, e.g. 2024-01-15T10:00:00Z)"
          },
          {
            flags: "--rc <currency>",
            description: "Set realized P&L currency"
          },
          {
            flags: "--realized <amount>",
            description: "Set realized P&L amount"
          }
        ],
        handler: "transaction/edit"
      },
      {
        name: "delete",
        description: "Delete a transaction",
        needsLedger: true,
        arguments: [
          {
            name: "uuid",
            description: "Transaction UUID",
            required: true
          }
        ],
        handler: "transaction/delete"
      },
      {
        name: "exclude",
        description: "Exclude or re-include a transaction from processing",
        needsLedger: true,
        arguments: [
          {
            name: "uuid",
            description: "Transaction UUID",
            required: true
          }
        ],
        options: [
          {
            flags: "--undo",
            description: "Re-include a previously excluded transaction"
          }
        ],
        handler: "transaction/exclude"
      },
      {
        name: "summary",
        description: "Show after-transaction P&L summary",
        needsLedger: true,
        arguments: [
          {
            name: "uuid",
            description: "Transaction UUID",
            required: true
          }
        ],
        handler: "transaction/summary"
      },
      {
        name: "loan-summary",
        description: "Show loan summary for a transaction",
        needsLedger: true,
        arguments: [
          {
            name: "uuid",
            description: "Transaction UUID",
            required: true
          }
        ],
        handler: "transaction/loan-summary"
      },
      {
        name: "open-close",
        description: "Show open/close details for a transaction",
        needsLedger: true,
        arguments: [
          {
            name: "uuid",
            description: "Transaction UUID",
            required: true
          }
        ],
        handler: "transaction/open-close"
      },
      {
        name: "balance-summary",
        description: "Show balance summary for a transaction",
        needsLedger: true,
        arguments: [
          {
            name: "uuid",
            description: "Transaction UUID",
            required: true
          }
        ],
        handler: "transaction/balance-summary"
      }
    ]
  },
  {
    name: "exchange",
    description: "Exchange API keys, sync, and file management",
    commands: [
      {
        name: "keys",
        description: "List registered exchange API keys",
        needsLedger: true,
        handler: "exchange/keys"
      },
      {
        name: "endpoints",
        description: "List exchange endpoints",
        options: [
          {
            flags: "--exchange <exchange>",
            description: "Exchange identifier",
            required: true
          }
        ],
        handler: "exchange/endpoints"
      },
      {
        name: "key-add",
        description: "Register a new exchange API key",
        needsLedger: true,
        options: [
          {
            flags: "--exchange <exchange>",
            description: "Exchange identifier",
            required: true
          },
          {
            flags: "--public-key <publicKey>",
            description: "Public API key",
            required: true
          },
          {
            flags: "--private-key <privateKey>",
            description: "Private API key",
            required: true
          },
          {
            flags: "--passphrase <passphrase>",
            description: "API passphrase (if required)"
          },
          {
            flags: "--sub-account <subAccount>",
            description: "Sub account name"
          },
          {
            flags: "--endpoints <json>",
            description:
              'Endpoints JSON, e.g. \'[{"endpoint":"trades"}]\' (run "exchange endpoints" to list)',
            required: true
          }
        ],
        handler: "exchange/key-add"
      },
      {
        name: "key-delete",
        description: "Remove an exchange API key",
        needsLedger: true,
        options: [
          {
            flags: "--exchange <exchange>",
            description: "Exchange identifier",
            required: true
          },
          {
            flags: "--sub-account <subAccount>",
            description: "Sub account name"
          }
        ],
        handler: "exchange/key-delete"
      },
      {
        name: "key-update",
        description: "Update an exchange API key's endpoints",
        needsLedger: true,
        options: [
          {
            flags: "--exchange <exchange>",
            description: "Exchange identifier",
            required: true
          },
          {
            flags: "--sub-account <subAccount>",
            description: "Sub account name",
            required: true
          },
          {
            flags: "--endpoints <json>",
            description:
              'Endpoints JSON, e.g. \'[{"endpoint":"trades"}]\' (run "exchange endpoints" to list)',
            required: true
          }
        ],
        handler: "exchange/key-update"
      },
      {
        name: "sync",
        description: "Start exchange sync job",
        needsLedger: true,
        options: [
          {
            flags: "--exchange <exchange>",
            description: "Exchange identifier",
            required: true
          },
          {
            flags: "--sub-account <subAccount>",
            description: "Sub account"
          },
          {
            flags: "--endpoint <endpoint>",
            description: "Specific endpoint to sync"
          }
        ],
        handler: "exchange/sync"
      },
      {
        name: "sync-status",
        description: "Show exchange sync job statuses",
        needsLedger: true,
        handler: "exchange/sync-status"
      },
      {
        name: "sync-cancel",
        description: "Cancel exchange sync job",
        needsLedger: true,
        options: [
          {
            flags: "--exchange <exchange>",
            description: "Exchange identifier",
            required: true
          },
          {
            flags: "--sub-account <subAccount>",
            description: "Sub account name"
          },
          {
            flags: "--endpoint <endpoint>",
            description: "Specific endpoint to cancel"
          }
        ],
        handler: "exchange/sync-cancel"
      },
      {
        name: "processing-status",
        description: "Show exchange processing status",
        handler: "exchange/processing-status"
      },
      {
        name: "files",
        description: "List active exchange files",
        needsLedger: true,
        handler: "exchange/files"
      },
      {
        name: "file-history",
        description: "Show file upload history",
        needsLedger: true,
        options: [
          {
            flags: "--offset <n>",
            description: "Pagination offset"
          }
        ],
        handler: "exchange/file-history"
      },
      {
        name: "file-details",
        description: "Show details of an uploaded file",
        needsLedger: true,
        arguments: [
          {
            name: "fileId",
            description: "File ID (numeric)",
            required: true
          }
        ],
        handler: "exchange/file-details"
      },
      {
        name: "file-upload",
        description:
          "Upload a file to an exchange\n\nCustom file format: https://support.cryptact.com/hc/en-us/articles/360002571312",
        needsLedger: true,
        arguments: [
          {
            name: "file",
            description: "Path to file",
            required: true
          }
        ],
        options: [
          {
            flags: "--exchange-file-id <id>",
            description: "Exchange file identifier (e.g. User.Custom)",
            required: true
          },
          {
            flags: "--timezone <tz>",
            description: "File timezone"
          },
          {
            flags: "--sub-id <subId>",
            description: "Sub ID"
          },
          {
            flags: "--password <password>",
            description: "File password (if encrypted)"
          }
        ],
        handler: "exchange/file-upload"
      }
    ]
  },
  {
    name: "wallet",
    description: "DeFi wallet address management",
    commands: [
      {
        name: "list",
        description: "List DeFi wallet addresses",
        needsLedger: true,
        handler: "exchange/wallets"
      },
      {
        name: "add",
        description: "Add a DeFi wallet address",
        needsLedger: true,
        options: [
          {
            flags: "--chain <chain>",
            description: "Blockchain name",
            required: true
          },
          {
            flags: "--address <address>",
            description: "Wallet address",
            required: true
          },
          {
            flags: "--memo <memo>",
            description: "Optional memo/tag"
          }
        ],
        handler: "exchange/wallet-add"
      },
      {
        name: "delete",
        description: "Remove a DeFi wallet address",
        needsLedger: true,
        options: [
          {
            flags: "--chain <chain>",
            description: "Blockchain name",
            required: true
          },
          {
            flags: "--address <address>",
            description: "Wallet address",
            required: true
          }
        ],
        handler: "exchange/wallet-delete"
      },
      {
        name: "update",
        description: "Update a DeFi wallet address",
        needsLedger: true,
        options: [
          {
            flags: "--chain <chain>",
            description: "Blockchain name",
            required: true
          },
          {
            flags: "--address <address>",
            description: "Wallet address",
            required: true
          },
          {
            flags: "--memo <memo>",
            description: "Optional memo/tag"
          }
        ],
        handler: "exchange/wallet-update"
      },
      {
        name: "add-multi",
        description: "Add a wallet address to multiple chains",
        needsLedger: true,
        options: [
          {
            flags: "--chains <chains>",
            description: "Comma-separated chain names (e.g. ethereum,polygon,arbitrum)",
            required: true
          },
          {
            flags: "--address <address>",
            description: "Wallet address",
            required: true
          },
          {
            flags: "--memo <memo>",
            description: "Optional memo/tag"
          }
        ],
        handler: "exchange/wallet-add-multi"
      },
      {
        name: "sync",
        description: "Start wallet sync job",
        needsLedger: true,
        options: [
          {
            flags: "--exchange <exchange>",
            description: "Exchange identifier",
            required: true
          },
          {
            flags: "--sub-account <subAccount>",
            description: "Sub account"
          },
          {
            flags: "--endpoint <endpoint>",
            description: "Specific endpoint to sync"
          }
        ],
        handler: "exchange/sync"
      },
      {
        name: "sync-status",
        description: "Show wallet sync job statuses",
        needsLedger: true,
        handler: "exchange/sync-status"
      },
      {
        name: "sync-cancel",
        description: "Cancel wallet sync job",
        needsLedger: true,
        options: [
          {
            flags: "--exchange <exchange>",
            description: "Exchange identifier",
            required: true
          },
          {
            flags: "--sub-account <subAccount>",
            description: "Sub account name"
          },
          {
            flags: "--endpoint <endpoint>",
            description: "Specific endpoint to cancel"
          }
        ],
        handler: "exchange/sync-cancel"
      }
    ]
  },
  {
    name: "portfolio",
    description: "Portfolio views",
    commands: [
      {
        name: "show",
        description: "Show portfolio",
        needsLedger: true,
        options: [
          {
            flags: "--reporting-ccy <ccy>",
            description: "Reporting currency (e.g. JPY, USD)"
          }
        ],
        handler: "portfolio/show"
      },
      {
        name: "history",
        description: "Show portfolio history (detailed, detailed-pnl, global-pnl)",
        needsLedger: true,
        options: [
          {
            flags: "--from <timestamp>",
            description: "Start Unix timestamp in milliseconds (e.g. 1704067200000 for 2024-01-01)"
          },
          {
            flags: "--to <timestamp>",
            description: "End Unix timestamp in milliseconds (e.g. 1735689600000 for 2025-01-01)"
          }
        ],
        arguments: [
          {
            name: "type",
            description: "Snapshot type: detailed, detailed-pnl, or global-pnl",
            required: true
          }
        ],
        handler: "portfolio/history"
      },
      {
        name: "coin-history",
        description: "Show single-asset portfolio history over time",
        needsLedger: true,
        options: [
          {
            flags: "--coin <coin>",
            description: "Coin symbol (e.g. BTC, ETH)",
            required: true
          },
          {
            flags: "--from <timestamp>",
            description: "Start Unix timestamp in milliseconds (e.g. 1704067200000 for 2024-01-01)",
            required: true
          },
          {
            flags: "--to <timestamp>",
            description: "End Unix timestamp in milliseconds (e.g. 1735689600000 for 2025-01-01)",
            required: true
          }
        ],
        handler: "portfolio/coin-history"
      }
    ]
  },
  {
    name: "billing",
    description: "Billing and subscription",
    commands: [
      {
        name: "plan",
        description: "Show current subscription plan",
        handler: "billing/plan"
      },
      {
        name: "plans",
        description: "List available subscription plans",
        handler: "billing/plans"
      },
      {
        name: "invoices",
        description: "Show invoice history",
        options: [
          {
            flags: "--limit <n>",
            description: "Max results"
          },
          {
            flags: "--ending-before <id>",
            description: "Cursor for previous page (invoice ID)"
          },
          {
            flags: "--starting-after <id>",
            description: "Cursor for next page (invoice ID)"
          }
        ],
        handler: "billing/invoices"
      }
    ]
  },
  {
    name: "settings",
    description: "User settings",
    commands: [
      {
        name: "show",
        description: "Display user settings",
        handler: "settings/show"
      },
      {
        name: "update",
        description: "Update user settings",
        options: [
          {
            flags: "--language <lang>",
            description: 'Language ("en" or "ja")',
            required: true
          }
        ],
        handler: "settings/update"
      }
    ]
  },
  {
    name: "mailing-list",
    description: "Mailing list subscriptions",
    commands: [
      {
        name: "show",
        description: "Show current mailing list subscriptions",
        handler: "mailing-list/show"
      }
    ]
  },
  {
    name: "defi",
    description: "DeFi transaction management",
    commands: [
      {
        name: "search",
        description: "Search DeFi transactions",
        needsLedger: true,
        options: [
          {
            flags: "--chains <chains>",
            description: "Comma-separated chain names (e.g. ethereum,polygon)",
            required: true
          },
          {
            flags: "--quick-filter <filter>",
            description: "Quick filter"
          },
          {
            flags: "--limit <n>",
            description: "Max results"
          },
          {
            flags: "--start-time <time>",
            description: "Start time (ISO 8601, e.g. 2024-01-01T00:00:00Z)"
          },
          {
            flags: "--end-time <time>",
            description: "End time (ISO 8601, e.g. 2024-12-31T23:59:59Z)"
          },
          {
            flags: "--sort-order <order>",
            description: "Sort order (ASC or DESC)"
          },
          {
            flags: "--chain-family <family>",
            description: "Chain family"
          },
          {
            flags: "--addresses <addrs>",
            description: "Comma-separated addresses"
          },
          {
            flags: "--services <svcs>",
            description: "Comma-separated services"
          },
          {
            flags: "--action-detail <details>",
            description: "Comma-separated action details"
          },
          {
            flags: "--asset-hashes <hashes>",
            description: "Comma-separated asset hashes"
          },
          {
            flags: "--page <n>",
            description: "Page number (0-based)"
          }
        ],
        handler: "defi/search"
      },
      {
        name: "edit",
        description: "Edit a DeFi transaction classification",
        needsLedger: true,
        options: [
          {
            flags: "--chain <chain>",
            description: "Blockchain name",
            required: true
          },
          {
            flags: "--tx-hash <hash>",
            description: "Transaction hash",
            required: true
          },
          {
            flags: "--action <action>",
            description:
              "DeFi action (SWAP, TRANSFER, BONUS, LOSS, PAY, HARVEST, ADD_LIQUIDITY, REMOVE_LIQUIDITY, etc.)",
            required: true
          },
          {
            flags: "--transfer-type <type>",
            description: "Transfer type (SELF or OTHER)"
          }
        ],
        handler: "defi/edit"
      },
      {
        name: "delete-edit",
        description: "Delete a DeFi transaction user edit",
        needsLedger: true,
        options: [
          {
            flags: "--chain <chain>",
            description: "Blockchain name",
            required: true
          },
          {
            flags: "--tx-hash <hash>",
            description: "Transaction hash",
            required: true
          }
        ],
        handler: "defi/delete-edit"
      },
      {
        name: "edits",
        description: "List DeFi user edits",
        needsLedger: true,
        options: [
          {
            flags: "--chains <chains>",
            description: "Comma-separated chain names (e.g. ethereum,polygon)",
            required: true
          }
        ],
        handler: "defi/edits"
      },
      {
        name: "accept-all",
        description: "Accept all DeFi suggestions",
        needsLedger: true,
        options: [
          {
            flags: "--start-time <time>",
            description: "Start time (ISO 8601, e.g. 2024-01-01T00:00:00Z)"
          },
          {
            flags: "--end-time <time>",
            description: "End time (ISO 8601, e.g. 2024-12-31T23:59:59Z)"
          },
          {
            flags: "--chain-family <family>",
            description: "Chain family"
          }
        ],
        handler: "defi/accept-all"
      },
      {
        name: "mark-risky",
        description: "Mark unclassified transactions as risky",
        needsLedger: true,
        options: [
          {
            flags: "--action <action>",
            description:
              "DeFi action (SWAP, TRANSFER, BONUS, LOSS, PAY, HARVEST, ADD_LIQUIDITY, REMOVE_LIQUIDITY, etc.)",
            required: true
          },
          {
            flags: "--start-time <time>",
            description: "Start time (ISO 8601, e.g. 2024-01-01T00:00:00Z)"
          },
          {
            flags: "--end-time <time>",
            description: "End time (ISO 8601, e.g. 2024-12-31T23:59:59Z)"
          },
          {
            flags: "--chain-family <family>",
            description: "Chain family"
          }
        ],
        handler: "defi/mark-risky"
      },
      {
        name: "mark-transfers-self",
        description: "Mark unclassified transfers as self-transfers",
        needsLedger: true,
        options: [
          {
            flags: "--start-time <time>",
            description: "Start time (ISO 8601, e.g. 2024-01-01T00:00:00Z)"
          },
          {
            flags: "--chain-family <family>",
            description: "Chain family"
          }
        ],
        handler: "defi/mark-transfers-self"
      },
      {
        name: "stats",
        description: "Show DeFi ledger stats",
        needsLedger: true,
        options: [
          {
            flags: "--start-time <time>",
            description: "Start time (ISO 8601, e.g. 2024-01-01T00:00:00Z)"
          },
          {
            flags: "--chain-family <family>",
            description: "Chain family"
          }
        ],
        handler: "defi/stats"
      }
    ]
  },
  {
    name: "live-view",
    description: "Live position views",
    commands: [
      {
        name: "position",
        description: "Show live exchange positions",
        needsLedger: true,
        options: [
          {
            flags: "--reporting-ccy <ccy>",
            description: "Reporting currency",
            required: true
          },
          {
            flags: "--snapshot-timestamp <ts>",
            description:
              'Snapshot Unix timestamp in milliseconds (run "live-view snapshots" to list)'
          },
          {
            flags: "--exchanges <json>",
            description: 'Exchanges JSON array (e.g. \'[{"exchange":"binance"}]\')',
            required: true
          }
        ],
        handler: "live-view/position"
      },
      {
        name: "snapshots",
        description: "List position snapshot timestamps",
        needsLedger: true,
        handler: "live-view/snapshots"
      },
      {
        name: "settings",
        description: "Show live-view sync settings",
        needsLedger: true,
        handler: "live-view/settings"
      },
      {
        name: "enable",
        description: "Enable live-view position snapshots",
        needsLedger: true,
        handler: "live-view/enable"
      }
    ]
  },
  {
    name: "instruments",
    description: "Instrument listings",
    commands: [
      {
        name: "list",
        description: "List all crypto and FX instruments",
        handler: "instruments/list"
      }
    ]
  },
  {
    name: "user",
    description: "User account",
    commands: [
      {
        name: "info",
        description: "Show user info",
        handler: "user/info"
      },
      {
        name: "referrals",
        description: "Show referral stats",
        handler: "user/referrals"
      }
    ]
  }
];
