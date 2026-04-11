/**
 * KausaLayer MCP - Check Route Status Tool
 * Check status of any route (funding, sweep, or direct)
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext } from '../auth/api-key';
import { CheckRouteStatusParams, CheckRouteStatusResult } from '../types';

export const checkRouteStatusTool: Tool = {
  name: 'check_route_status',
  description:
    'Check the status of a maze route, funding request, or sweep. ' +
    'Returns progress information including completed hops and percentage.',
  inputSchema: {
    type: 'object',
    properties: {
      route_id: {
        type: 'string',
        description: 'The route ID (route_xxx, fund_xxx, pocket_xxx, or sweep_xxx)',
      },
    },
    required: ['route_id'],
  },
};

export async function handleCheckRouteStatus(
  params: CheckRouteStatusParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<CheckRouteStatusResult> {
  const { route_id } = params;

  let response;

  // Determine which endpoint to call based on ID prefix
  if (route_id.startsWith('sweep_')) {
    response = await apiClient.getSweepStatus(route_id);
  } else {
    // For fund_xxx, pocket_xxx, or route_xxx, use funding status
    response = await apiClient.getFundingStatus(route_id);
  }

  if (!response.success) {
    throw new Error(response.error || 'Route not found');
  }

  return {
    route_id: response.request_id,
    status: response.status,
    progress: response.progress ? {
      completed_nodes: response.progress.completed_nodes,
      total_nodes: response.progress.total_nodes,
      current_level: response.progress.current_level,
      total_levels: response.progress.total_levels,
      percentage: response.progress.percentage,
    } : undefined,
    error: response.error,
  };
}
