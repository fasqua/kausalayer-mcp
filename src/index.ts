#!/usr/bin/env node
/**
 * KausaLayer MCP Server
 * Privacy infrastructure for AI agents on Solana
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

import { MCPDatabase } from './db/database';
import { TierManager } from './auth/tier';
import { ApiKeyAuth, AuthContext } from './auth/api-key';
import { MazeApiClient } from './api/maze-client';

// Import tools
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
  // Phase 3 - Batch Operations
  sweepAllPocketsTool,
  handleSweepAllPockets,
  getRouteHistoryTool,
  handleGetRouteHistory,
  getUsageStatsTool,
  handleGetUsageStats,
  getPocketTransactionsTool,
  handleGetPocketTransactions,
  getTierInfoTool,
  handleGetTierInfo,
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

// Load environment variables
dotenv.config();

// Configuration
const config = {
  mcpPort: parseInt(process.env.MCP_PORT || '3034'),
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  kausaMint: process.env.KAUSA_MINT || 'BWXSNRBKMviG68MqavyssnzDq4qSArcN7eNYjqEfpump',
  mazeApiUrl: process.env.MAZE_API_URL || 'http://localhost:3033',
  mcpDbPath: process.env.MCP_DB_PATH || './mcp.db',
};

// Initialize components
const db = new MCPDatabase(config.mcpDbPath);
const tierManager = new TierManager(config.solanaRpcUrl, config.kausaMint, config.mazeApiUrl);
const auth = new ApiKeyAuth(db, tierManager);
const apiClient = new MazeApiClient(config.mazeApiUrl);

// All tools
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

// Create MCP server
const server = new Server(
  {
    name: 'kausalayer-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Get API key from environment or request
function getApiKey(): string | null {
  return process.env.KAUSALAYER_API_KEY || null;
}

// Handle list tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Authenticate
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'UNAUTHORIZED',
            message: 'API key not configured. Set KAUSALAYER_API_KEY environment variable.',
          }),
        },
      ],
      isError: true,
    };
  }

  const authContext = await auth.authenticate(apiKey);
  if (!authContext) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'INVALID_API_KEY',
            message: 'Invalid or expired API key.',
          }),
        },
      ],
      isError: true,
    };
  }

  try {
    let result: any;

    switch (name) {
      case 'maze_route':
        result = await handleMazeRoute(args as any, authContext, apiClient, auth);
        break;
      case 'create_pocket':
        result = await handleCreatePocket(args as any, authContext, apiClient, auth);
        break;
      case 'get_pocket_info':
        result = await handleGetPocketInfo(args as any, authContext, apiClient);
        break;
      case 'export_pocket_key':
        result = await handleExportPocketKey(args as any, authContext, apiClient);
        break;
      case 'sweep_pocket':
        result = await handleSweepPocket(args as any, authContext, apiClient, auth);
        break;
      case 'list_pockets':
        result = await handleListPockets(args as any, authContext, apiClient);
        break;
      case 'check_route_status':
        result = await handleCheckRouteStatus(args as any, authContext, apiClient);
        break;
      case 'retry_route':
        result = await handleRetryRoute(args as any, authContext, apiClient);
        break;
      case 'recover_route':
        result = await handleRecoverRoute(args as any, authContext, apiClient);
        break;
      case 'estimate_fee':
        result = await handleEstimateFee(args as any, authContext);
        break;
      // Phase 0 - Wallet & Delete Tools
      case 'list_saved_wallets':
        result = await handleListSavedWallets(args as any, authContext, apiClient);
        break;
      case 'add_saved_wallet':
        result = await handleAddSavedWallet(args as any, authContext, apiClient);
        break;
      case 'remove_saved_wallet':
        result = await handleRemoveSavedWallet(args as any, authContext, apiClient);
        break;
      case 'delete_pocket':
        result = await handleDeletePocket(args as any, authContext, apiClient);
        break;
      // Phase 1 - Pocket Management
      case 'rename_pocket':
        result = await handleRenamePocket(args as any, authContext, apiClient);
        break;
      case 'archive_pocket':
        result = await handleArchivePocket(args as any, authContext, apiClient);
        break;
      // Phase 2 - History & Stats
      case 'get_route_history':
        result = await handleGetRouteHistory(args as any, authContext, apiClient);
        break;
      case 'get_usage_stats':
        result = await handleGetUsageStats(args as any, authContext, apiClient);
        break;
      case 'get_pocket_transactions':
        result = await handleGetPocketTransactions(args as any, authContext, apiClient);
        break;
      case 'get_tier_info':
        result = await handleGetTierInfo(args as any, authContext, apiClient, tierManager);
        break;
      // Phase 3 - Batch Operations
      case "sweep_all_pockets":
        result = await handleSweepAllPockets(args as any, authContext, apiClient, auth);
        break;
      // Phase 4 - P2P Transfers
      case 'send_to_pocket':
        result = await handleSendToPocket(args as any, authContext, apiClient, auth);
        break;
      case 'get_p2p_status':
        result = await handleGetP2pStatus(args as any, authContext, apiClient);
        break;
      case 'recover_p2p':
        result = await handleRecoverP2p(args as any, authContext, apiClient);
        break;
      // Phase 4 - Swap Operations
      case 'swap_quote':
        result = await handleSwapQuote(args as any, authContext, apiClient);
        break;
      case 'swap_execute':
        result = await handleSwapExecute(args as any, authContext, apiClient, auth);
        break;
      case 'get_token_balances':
        result = await handleGetTokenBalances(args as any, authContext, apiClient);
        break;
      // Phase 4 - Contacts
      case 'add_contact':
        result = await handleAddContact(args as any, authContext, apiClient);
        break;
      case 'list_contacts':
        result = await handleListContacts(args as any, authContext, apiClient);
        break;
      case 'delete_contact':
        result = await handleDeleteContact(args as any, authContext, apiClient);
        break;
      // Phase 4 - Sweep Status
      case 'get_sweep_status':
        result = await handleGetSweepStatus(args as any, authContext, apiClient);
        break;
      // Phase 4 - Token List & Resolve
      case 'get_token_list':
        result = await handleGetTokenList(args as any, authContext, apiClient);
        break;
      case 'resolve_token':
        result = await handleResolveToken(args as any, authContext, apiClient);
        break;
      // Phase 4 - Maze Preferences
      case 'get_maze_preferences':
        result = await handleGetMazePreferences(args as any, authContext, apiClient);
        break;
      case 'save_maze_preferences':
        result = await handleSaveMazePreferences(args as any, authContext, apiClient);
        break;
      // KausaPay
      case 'kausa_pay':
        result = await handleKausaPay(args as any, authContext, apiClient, auth);
        break;
      // KausaGate
      case 'kausa_gate_register':
        result = await handleKausaGateRegister(args as any, authContext, apiClient, auth);
        break;
      case 'kausa_gate_list':
        result = await handleKausaGateList(args as any, authContext, apiClient, auth);
        break;
      case 'kausa_gate_remove':
        result = await handleKausaGateRemove(args as any, authContext, apiClient, auth);
        break;
        // KausaLink - Send Links
        case 'create_send_link':
          result = await handleCreateSendLink(args as any, authContext, apiClient);
          break;
        case 'get_send_link_info':
          result = await handleGetSendLinkInfo(args as any, authContext, apiClient);
          break;
        case 'claim_send_link':
          result = await handleClaimSendLink(args as any, authContext, apiClient);
          break;
        case 'list_send_links':
          result = await handleListSendLinks(args as any, authContext, apiClient);
          break;
        // Proof of Privacy
        case 'get_proof_of_privacy':
          result = await handleGetProofOfPrivacy(args as any, authContext, apiClient);
          break;
        case 'download_proof':
          result = await handleDownloadProof(args as any, authContext, apiClient);
          break;
        case 'verify_proof':
          result = await handleVerifyProof(args as any, authContext, apiClient);
          break;
        // Transaction History
        case 'get_transaction_history':
          result = await handleGetTransactionHistory(args as any, authContext, apiClient);
          break;
            default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: 'UNKNOWN_TOOL',
                message: `Unknown tool: ${name}`,
              }),
            },
          ],
          isError: true,
        };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'TOOL_ERROR',
            message: error.message || 'Unknown error',
          }),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('KausaLayer MCP server started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
