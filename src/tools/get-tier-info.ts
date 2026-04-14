/**
 * KausaLayer MCP - Get Tier Info Tool
 * Get user's current tier, limits, and upgrade path
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { GetTierInfoParams, GetTierInfoResult } from '../types';

export const getTierInfoTool: Tool = {
  name: 'get_tier_info',
  description: 'Get current tier info including limits, KAUSA balance, and upgrade requirements.',
  inputSchema: {
    type: 'object',
    properties: {
      wallet_address: {
        type: 'string',
        description: 'Optional: Wallet address to check KAUSA token balance for tier calculation',
      },
    },
  },
};

export async function handleGetTierInfo(
  params: GetTierInfoParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<GetTierInfoResult> {
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  const response = await apiClient.getTierInfo(metaAddress, params.wallet_address);

  return {
    current_tier: response.current_tier,
    kausa_balance: response.kausa_balance,
    limits: {
      fee_percent: response.limits.fee_percent,
      max_amount_sol: response.limits.max_amount_sol,
      daily_routes: response.limits.daily_routes,
    },
    next_tier: response.next_tier,
    kausa_needed: response.kausa_needed,
    routes_used_today: response.routes_used_today,
    routes_remaining_today: response.routes_remaining_today,
  };
}
