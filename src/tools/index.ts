/**
 * KausaLayer MCP - Tools Index
 * Export all tool handlers
 */

// Phase 0 - Core Tools
export { mazeRouteTool, handleMazeRoute } from './maze-route';
export { createPocketTool, handleCreatePocket } from './create-pocket';
export { getPocketInfoTool, handleGetPocketInfo } from './get-pocket-info';
export { exportPocketKeyTool, handleExportPocketKey } from './export-pocket-key';
export { sweepPocketTool, handleSweepPocket } from './sweep-pocket';
export { listPocketsTool, handleListPockets } from './list-pockets';
export { checkRouteStatusTool, handleCheckRouteStatus } from './check-route-status';
export { retryRouteTool, handleRetryRoute } from './retry-route';
export { recoverRouteTool, handleRecoverRoute } from './recover-route';
export { estimateFeeTool, handleEstimateFee } from './estimate-fee';

// Phase 0 - Wallet & Delete Tools
export { listSavedWalletsTool, handleListSavedWallets } from './list-saved-wallets';
export { addSavedWalletTool, handleAddSavedWallet } from './add-saved-wallet';
export { removeSavedWalletTool, handleRemoveSavedWallet } from './remove-saved-wallet';
export { deletePocketTool, handleDeletePocket } from './delete-pocket';

// Phase 1 - Pocket Management
export { renamePocketTool, handleRenamePocket } from './rename-pocket';
export { archivePocketTool, handleArchivePocket } from './archive-pocket';

// Phase 2 - History & Stats
export { getRouteHistoryTool, handleGetRouteHistory } from './get-route-history';
export { getUsageStatsTool, handleGetUsageStats } from './get-usage-stats';
export { getPocketTransactionsTool, handleGetPocketTransactions } from './get-pocket-transactions';
export { getTierInfoTool, handleGetTierInfo } from './get-tier-info';

// Phase 3 - Batch Operations
export { sweepAllPocketsTool, handleSweepAllPockets } from './sweep-all-pockets';

// Phase 4 - P2P Transfers
export { sendToPocketTool, handleSendToPocket } from './send-to-pocket';
export { getP2pStatusTool, handleGetP2pStatus } from './get-p2p-status';
export { recoverP2pTool, handleRecoverP2p } from './recover-p2p';

// Phase 4 - Swap Operations
export { swapQuoteTool, handleSwapQuote } from './swap-quote';
export { swapExecuteTool, handleSwapExecute } from './swap-execute';
export { getTokenBalancesTool, handleGetTokenBalances } from './get-token-balances';

// Phase 4 - Contacts
export { addContactTool, handleAddContact } from './add-contact';
export { listContactsTool, handleListContacts } from './list-contacts';
export { deleteContactTool, handleDeleteContact } from './delete-contact';

// Phase 4 - Sweep Status
export { getSweepStatusTool, handleGetSweepStatus } from './get-sweep-status';

// Phase 4 - Token List & Resolve
export { getTokenListTool, handleGetTokenList } from './get-token-list';
export { resolveTokenTool, handleResolveToken } from './resolve-token';

// Phase 4 - Maze Preferences
export { getMazePreferencesTool, handleGetMazePreferences } from './get-maze-preferences';
export { saveMazePreferencesTool, handleSaveMazePreferences } from './save-maze-preferences';

// KausaPay - x402/MPP Payment
export { kausaPayTool, handleKausaPay } from './kausa-pay';

// KausaGate - API Monetization
export { kausaGateRegisterTool, handleKausaGateRegister } from './kausa-gate-register';
export { kausaGateListTool, handleKausaGateList } from './kausa-gate-list';
export { kausaGateRemoveTool, handleKausaGateRemove } from './kausa-gate-remove';
