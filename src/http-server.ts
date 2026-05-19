#!/usr/bin/env node
/**
 * KausaLayer MCP HTTP/SSE Server
 * Exposes MCP server via HTTP for remote AI agents
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

import { MCPDatabase } from './db/database';
import { TierManager } from './auth/tier';
import { ApiKeyAuth } from './auth/api-key';
import { MazeApiClient } from './api/maze-client';

// Import tool handlers
import {
  mazeRouteTool,
  handleMazeRoute,
  createPocketTool,
  handleCreatePocket,
  getPocketInfoTool,
  handleGetPocketInfo,
  exportPocketKeyTool,
  handleExportPocketKey,
  sweepPocketTool,
  handleSweepPocket,
  listPocketsTool,
  handleListPockets,
  checkRouteStatusTool,
  handleCheckRouteStatus,
  retryRouteTool,
  handleRetryRoute,
  recoverRouteTool,
  handleRecoverRoute,
  estimateFeeTool,
  handleEstimateFee,
  // Phase 0 - Wallet & Delete Tools
  listSavedWalletsTool,
  handleListSavedWallets,
  addSavedWalletTool,
  handleAddSavedWallet,
  removeSavedWalletTool,
  handleRemoveSavedWallet,
  deletePocketTool,
  handleDeletePocket,
  // Phase 1 - Pocket Management
  renamePocketTool,
  handleRenamePocket,
  archivePocketTool,
  handleArchivePocket,
  // Phase 2 - History & Stats
  getRouteHistoryTool,
  handleGetRouteHistory,
  getUsageStatsTool,
  handleGetUsageStats,
  getPocketTransactionsTool,
  handleGetPocketTransactions,
  getTierInfoTool,
  handleGetTierInfo,
  // Phase 3 - Batch Operations
  sweepAllPocketsTool,
  handleSweepAllPockets,
  // Phase 4 - P2P Transfers
  sendToPocketTool,
  handleSendToPocket,
  getP2pStatusTool,
  handleGetP2pStatus,
  recoverP2pTool,
  handleRecoverP2p,
  // Phase 4 - Swap Operations
  swapQuoteTool,
  handleSwapQuote,
  swapExecuteTool,
  handleSwapExecute,
  getTokenBalancesTool,
  handleGetTokenBalances,
  // Phase 4 - Contacts
  addContactTool,
  handleAddContact,
  listContactsTool,
  handleListContacts,
  deleteContactTool,
  handleDeleteContact,
  // Phase 4 - Sweep Status
  getSweepStatusTool,
  handleGetSweepStatus,
  // Phase 4 - Token List & Resolve
  getTokenListTool,
  handleGetTokenList,
  resolveTokenTool,
  handleResolveToken,
  // Phase 4 - Maze Preferences
  getMazePreferencesTool,
  handleGetMazePreferences,
  saveMazePreferencesTool,
  handleSaveMazePreferences,
  // KausaPay
  kausaPayTool,
  handleKausaPay,
  // KausaGate
  kausaGateRegisterTool,
  handleKausaGateRegister,
  kausaGateListTool,
  handleKausaGateList,
  kausaGateRemoveTool,
  handleKausaGateRemove,
  // KausaLink - Send Links
  createSendLinkTool,
  handleCreateSendLink,
  getSendLinkInfoTool,
  handleGetSendLinkInfo,
  claimSendLinkTool,
  handleClaimSendLink,
  listSendLinksTool,
  handleListSendLinks,
  // Proof of Privacy
  getProofOfPrivacyTool,
  handleGetProofOfPrivacy,
  downloadProofTool,
  handleDownloadProof,
  verifyProofTool,
  handleVerifyProof,
  // Transaction History
  getTransactionHistoryTool,
  handleGetTransactionHistory,
} from './tools';

// Load environment
dotenv.config();

// Config
const config = {
  port: parseInt(process.env.MCP_PORT || '3034'),
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  kausaMint: process.env.KAUSA_MINT || 'BWXSNRBKMviG68MqavyssnzDq4qSArcN7eNYjqEfpump',
  mazeApiUrl: process.env.MAZE_API_URL || 'http://localhost:3033',
  mcpDbPath: process.env.MCP_DB_PATH || './mcp.db',
};

// Initialize
const db = new MCPDatabase(config.mcpDbPath);
const tierManager = new TierManager(config.solanaRpcUrl, config.kausaMint, config.mazeApiUrl);
const auth = new ApiKeyAuth(db, tierManager);
const apiClient = new MazeApiClient(config.mazeApiUrl);

// All tools for listing
const tools = [
  mazeRouteTool,
  createPocketTool,
  getPocketInfoTool,
  exportPocketKeyTool,
  sweepPocketTool,
  listPocketsTool,
  checkRouteStatusTool,
  retryRouteTool,
  recoverRouteTool,
  estimateFeeTool,
  // Phase 0 - Wallet & Delete Tools
  listSavedWalletsTool,
  addSavedWalletTool,
  removeSavedWalletTool,
  deletePocketTool,
  // Phase 1 - Pocket Management
  renamePocketTool,
  archivePocketTool,
  // Phase 2 - History & Stats
  getRouteHistoryTool,
  getUsageStatsTool,
  getPocketTransactionsTool,
  getTierInfoTool,
  // Phase 3 - Batch Operations
  sweepAllPocketsTool,
  // Phase 4 - P2P Transfers
  sendToPocketTool,
  getP2pStatusTool,
  recoverP2pTool,
  // Phase 4 - Swap Operations
  swapQuoteTool,
  swapExecuteTool,
  getTokenBalancesTool,
  // Phase 4 - Contacts
  addContactTool,
  listContactsTool,
  deleteContactTool,
  // Phase 4 - Sweep Status
  getSweepStatusTool,
  // Phase 4 - Token List & Resolve
  getTokenListTool,
  resolveTokenTool,
  // Phase 4 - Maze Preferences
  getMazePreferencesTool,
  saveMazePreferencesTool,
  // KausaPay
  kausaPayTool,
  // KausaGate
  kausaGateRegisterTool,
  kausaGateListTool,
  kausaGateRemoveTool,
  // KausaLink - Send Links
  createSendLinkTool,
  getSendLinkInfoTool,
  claimSendLinkTool,
  listSendLinksTool,
  // Proof of Privacy
  getProofOfPrivacyTool,
  downloadProofTool,
  verifyProofTool,
  // Transaction History
  getTransactionHistoryTool,
];

// Create Express app
const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'kausalayer-mcp',
    version: '1.0.0',
  });
});

// List tools
app.get('/tools', (req, res) => {
  res.json({ tools });
});

// Register API key
app.post('/register', async (req: Request, res: Response) => {
  const { wallet_address, signature } = req.body;

  if (!wallet_address || !signature) {
    return res.status(400).json({
      error: 'INVALID_REQUEST',
      message: 'wallet_address and signature required',
    });
  }

  // Generate API key from signature
  const apiKey = ApiKeyAuth.generateApiKey(signature);

  // Register in database
  const success = auth.registerApiKey(apiKey, wallet_address);

  if (success) {
    res.json({
      success: true,
      api_key: apiKey,
      message: 'API key registered. Keep it safe!',
    });
  } else {
    res.status(500).json({
      error: 'REGISTRATION_FAILED',
      message: 'Failed to register API key',
    });
  }
});

// Call tool
app.post('/call', async (req: Request, res: Response) => {
  const apiKey = req.headers['x-api-key'] as string;
  const { tool, arguments: args } = req.body;

  // Validate API key
  if (!apiKey) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'x-api-key header required',
    });
  }

  const authContext = await auth.authenticate(apiKey);
  if (!authContext) {
    return res.status(401).json({
      error: 'INVALID_API_KEY',
      message: 'Invalid or expired API key',
    });
  }

  // Validate tool name
  if (!tool) {
    return res.status(400).json({
      error: 'INVALID_REQUEST',
      message: 'tool name required',
    });
  }

  try {
    let result: any;

    switch (tool) {
      case 'maze_route':
        result = await handleMazeRoute(args, authContext, apiClient, auth);
        break;
      case 'create_pocket':
        result = await handleCreatePocket(args, authContext, apiClient, auth);
        break;
      case 'get_pocket_info':
        result = await handleGetPocketInfo(args, authContext, apiClient);
        break;
      case 'export_pocket_key':
        result = await handleExportPocketKey(args, authContext, apiClient);
        break;
      case 'sweep_pocket':
        result = await handleSweepPocket(args, authContext, apiClient, auth);
        break;
      case 'list_pockets':
        result = await handleListPockets(args, authContext, apiClient);
        break;
      case 'check_route_status':
        result = await handleCheckRouteStatus(args, authContext, apiClient);
        break;
      case 'retry_route':
        result = await handleRetryRoute(args, authContext, apiClient);
        break;
      case 'recover_route':
        result = await handleRecoverRoute(args, authContext, apiClient);
        break;
      case 'estimate_fee':
        result = await handleEstimateFee(args, authContext);
        break;
      // Phase 0 - Wallet & Delete Tools
      case 'list_saved_wallets':
        result = await handleListSavedWallets(args, authContext, apiClient);
        break;
      case 'add_saved_wallet':
        result = await handleAddSavedWallet(args, authContext, apiClient);
        break;
      case 'remove_saved_wallet':
        result = await handleRemoveSavedWallet(args, authContext, apiClient);
        break;
      case 'delete_pocket':
        result = await handleDeletePocket(args, authContext, apiClient);
        break;
      // Phase 1 - Pocket Management
      case 'rename_pocket':
        result = await handleRenamePocket(args, authContext, apiClient);
        break;
      case 'archive_pocket':
        result = await handleArchivePocket(args, authContext, apiClient);
        break;
      // Phase 2 - History & Stats
      case 'get_route_history':
        result = await handleGetRouteHistory(args, authContext, apiClient);
        break;
      case 'get_usage_stats':
        result = await handleGetUsageStats(args, authContext, apiClient);
        break;
      case 'get_pocket_transactions':
        result = await handleGetPocketTransactions(args, authContext, apiClient);
        break;
      case 'get_tier_info':
        result = await handleGetTierInfo(args, authContext, apiClient, tierManager);
        break;
      // Phase 3 - Batch Operations
      case 'sweep_all_pockets':
        result = await handleSweepAllPockets(args, authContext, apiClient, auth);
        break;
      // Phase 4 - P2P Transfers
      case 'send_to_pocket':
        result = await handleSendToPocket(args, authContext, apiClient, auth);
        break;
      case 'get_p2p_status':
        result = await handleGetP2pStatus(args, authContext, apiClient);
        break;
      case 'recover_p2p':
        result = await handleRecoverP2p(args, authContext, apiClient);
        break;
      // Phase 4 - Swap Operations
      case 'swap_quote':
        result = await handleSwapQuote(args, authContext, apiClient);
        break;
      case 'swap_execute':
        result = await handleSwapExecute(args, authContext, apiClient, auth);
        break;
      case 'get_token_balances':
        result = await handleGetTokenBalances(args, authContext, apiClient);
        break;
      // Phase 4 - Contacts
      case 'add_contact':
        result = await handleAddContact(args, authContext, apiClient);
        break;
      case 'list_contacts':
        result = await handleListContacts(args, authContext, apiClient);
        break;
      case 'delete_contact':
        result = await handleDeleteContact(args, authContext, apiClient);
        break;
      // Phase 4 - Sweep Status
      case 'get_sweep_status':
        result = await handleGetSweepStatus(args, authContext, apiClient);
        break;
      // Phase 4 - Token List & Resolve
      case 'get_token_list':
        result = await handleGetTokenList(args, authContext, apiClient);
        break;
      case 'resolve_token':
        result = await handleResolveToken(args, authContext, apiClient);
        break;
      // Phase 4 - Maze Preferences
      case 'get_maze_preferences':
        result = await handleGetMazePreferences(args, authContext, apiClient);
        break;
      case 'save_maze_preferences':
        result = await handleSaveMazePreferences(args, authContext, apiClient);
        break;
      // KausaPay
      case 'kausa_pay':
        result = await handleKausaPay(args, authContext, apiClient, auth);
        break;
      // KausaGate
      case 'kausa_gate_register':
        result = await handleKausaGateRegister(args, authContext, apiClient, auth);
        break;
      case 'kausa_gate_list':
        result = await handleKausaGateList(args, authContext, apiClient, auth);
        break;
      case 'kausa_gate_remove':
        result = await handleKausaGateRemove(args, authContext, apiClient, auth);
        break;
      // KausaLink - Send Links
      case 'create_send_link':
        result = await handleCreateSendLink(args, authContext, apiClient);
        break;
      case 'get_send_link_info':
        result = await handleGetSendLinkInfo(args, authContext, apiClient);
        break;
      case 'claim_send_link':
        result = await handleClaimSendLink(args, authContext, apiClient);
        break;
      case 'list_send_links':
        result = await handleListSendLinks(args, authContext, apiClient);
        break;
      // Proof of Privacy
      case 'get_proof_of_privacy':
        result = await handleGetProofOfPrivacy(args, authContext, apiClient);
        break;
      case 'download_proof':
        result = await handleDownloadProof(args, authContext, apiClient);
        break;
      case 'verify_proof':
        result = await handleVerifyProof(args, authContext, apiClient);
        break;
      // Transaction History
      case 'get_transaction_history':
        result = await handleGetTransactionHistory(args, authContext, apiClient);
        break;
      default:
        return res.status(400).json({
          error: 'UNKNOWN_TOOL',
          message: `Unknown tool: ${tool}`,
        });
    }

    res.json({
      success: true,
      result,
      tier: authContext.tier,
      routes_today: authContext.routesToday,
    });
  } catch (error: any) {
    res.status(400).json({
      error: 'TOOL_ERROR',
      message: error.message || 'Unknown error',
    });
  }
});

// Get tier info
app.get('/tier', async (req: Request, res: Response) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'x-api-key header required',
    });
  }

  const authContext = await auth.authenticate(apiKey);
  if (!authContext) {
    return res.status(401).json({
      error: 'INVALID_API_KEY',
      message: 'Invalid or expired API key',
    });
  }

  res.json({
    wallet: authContext.walletAddress,
    tier: authContext.tier,
    limits: authContext.limits,
    kausa_balance: authContext.kausaBalance,
    routes_today: authContext.routesToday,
  });
});

// Start server
app.listen(config.port, '0.0.0.0', () => {
  console.log(`KausaLayer MCP HTTP server listening on port ${config.port}`);
  console.log(`Health: http://localhost:${config.port}/health`);
  console.log(`Tools:  http://localhost:${config.port}/tools`);
});
