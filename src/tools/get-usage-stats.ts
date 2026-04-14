/**
 * KausaLayer MCP - Get Usage Stats Tool
 * Get usage statistics for the user
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { GetUsageStatsParams, GetUsageStatsResult } from '../types';

export const getUsageStatsTool: Tool = {
  name: 'get_usage_stats',
  description: 'Get usage statistics including routes today, this week, this month, and total volume.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleGetUsageStats(
  params: GetUsageStatsParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<GetUsageStatsResult> {
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  const response = await apiClient.getUsageStats(metaAddress);

  return {
    routes_today: response.routes_today,
    routes_this_week: response.routes_this_week,
    routes_this_month: response.routes_this_month,
    total_volume_sol: response.total_volume_sol,
  };
}
