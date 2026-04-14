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
  getRouteHistoryTool,
  handleGetRouteHistory,
  getUsageStatsTool,
  handleGetUsageStats,
  getPocketTransactionsTool,
  handleGetPocketTransactions,
  getTierInfoTool,
  handleGetTierInfo,
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
