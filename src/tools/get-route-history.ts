/**
 * KausaLayer MCP - Get Route History Tool
 * Get history of all routes (funding + sweeps)
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { GetRouteHistoryParams, GetRouteHistoryResult, RouteHistoryEntry } from '../types';

export const getRouteHistoryTool: Tool = {
  name: 'get_route_history',
  description: 'Get history of all maze routes (both funding and sweeps) for the user.',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of routes to return. Default: 50, Max: 100',
      },
    },
  },
};

export async function handleGetRouteHistory(
  params: GetRouteHistoryParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<GetRouteHistoryResult> {
  const { limit = 50 } = params;
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  const response = await apiClient.getRouteHistory(metaAddress, limit);

  const routes: RouteHistoryEntry[] = response.routes.map(r => ({
    id: r.id,
    route_type: r.route_type as 'funding' | 'sweep',
    amount_sol: r.amount_sol,
    fee_lamports: r.fee_lamports,
    status: r.status,
    destination: r.destination,
    created_at: new Date(r.created_at * 1000).toISOString(),
    completed_at: r.completed_at ? new Date(r.completed_at * 1000).toISOString() : null,
    tx_signature: r.tx_signature,
  }));

  return {
    routes,
    count: response.count,
  };
}
