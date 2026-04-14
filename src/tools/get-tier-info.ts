/**
 * KausaLayer MCP - Get Tier Info Tool
 * Get user's current tier using TierManager (proper multi-token support)
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext } from '../auth/api-key';
import { TierManager } from '../auth/tier';
import { GetTierInfoParams, GetTierInfoResult, TIER_THRESHOLDS, Tier } from '../types';

export const getTierInfoTool: Tool = {
  name: 'get_tier_info',
  description: 'Get current tier info including limits, token balances, and upgrade requirements. Supports multi-token tier system.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleGetTierInfo(
  params: GetTierInfoParams,
  authContext: AuthContext,
  apiClient: MazeApiClient,
  tierManager?: TierManager
): Promise<GetTierInfoResult> {
  // Get wallet address from auth context
  const walletAddress = authContext.walletAddress;
  
  // Use TierManager to get proper tier info (with multi-token support)
  let tierInfo;
  if (tierManager) {
    tierInfo = await tierManager.getWalletTier(walletAddress);
  } else {
    // Fallback: create temporary TierManager
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const kausaMint = process.env.KAUSA_MINT || 'BWXSNRBKMviG68MqavyssnzDq4qSArcN7eNYjqEfpump';
    const mazeApiUrl = process.env.MAZE_API_URL || 'http://localhost:3033';
    const tempTierManager = new TierManager(rpcUrl, kausaMint, mazeApiUrl);
    tierInfo = await tempTierManager.getWalletTier(walletAddress);
  }
  
  // Get usage stats from backend
  const metaAddress = `meta_${walletAddress}`;
  let routesToday = 0;
  try {
    const usageStats = await apiClient.getUsageStats(metaAddress);
    routesToday = usageStats.routes_today;
  } catch (e) {
    // If usage stats fails, continue with 0
  }
  
  // Calculate next tier and kausa needed
  const currentTier = tierInfo.tier;
  let nextTier: string | null = null;
  let kausaNeeded: number | null = null;
  
  if (currentTier === Tier.FREE) {
    nextTier = 'BASIC';
    kausaNeeded = TIER_THRESHOLDS[Tier.BASIC] - tierInfo.kausaBalance;
  } else if (currentTier === Tier.BASIC) {
    nextTier = 'PRO';
    kausaNeeded = TIER_THRESHOLDS[Tier.PRO] - tierInfo.kausaBalance;
  } else if (currentTier === Tier.PRO) {
    nextTier = 'ENTERPRISE';
    kausaNeeded = TIER_THRESHOLDS[Tier.ENTERPRISE] - tierInfo.kausaBalance;
  }
  // ENTERPRISE has no next tier
  
  const routesRemaining = Math.max(0, tierInfo.limits.daily_routes - routesToday);
  
  return {
    current_tier: currentTier,
    kausa_balance: tierInfo.kausaBalance,
    limits: {
      fee_percent: tierInfo.limits.fee_percent,
      max_amount_sol: tierInfo.limits.max_amount_sol,
      daily_routes: tierInfo.limits.daily_routes,
    },
    next_tier: nextTier,
    kausa_needed: kausaNeeded,
    routes_used_today: routesToday,
    routes_remaining_today: routesRemaining,
  };
}
