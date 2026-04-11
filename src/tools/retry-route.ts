/**
 * KausaLayer MCP - Retry Route Tool
 * Retry a failed route from last successful hop
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext } from '../auth/api-key';
import { RetryRouteParams, RetryRouteResult } from '../types';

export const retryRouteTool: Tool = {
  name: 'retry_route',
  description:
    'Retry a failed route from where it stopped. ' +
    'Attempts to resume the maze routing from the last successful node.',
  inputSchema: {
    type: 'object',
    properties: {
      route_id: {
        type: 'string',
        description: 'The route ID to retry (sweep_xxx)',
      },
    },
    required: ['route_id'],
  },
};

export async function handleRetryRoute(
  params: RetryRouteParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<RetryRouteResult> {
  const { route_id } = params;

  // Currently only sweep resume is supported in REST API
  if (!route_id.startsWith('sweep_')) {
    throw new Error('Retry is currently only supported for sweep operations. Use recover_route for funding issues.');
  }

  // Call REST API
  const response = await apiClient.resumeSweep(route_id);

  if (!response.success) {
    throw new Error(response.message || 'Failed to retry route');
  }

  return {
    route_id: response.sweep_id || route_id,
    status: 'retrying',
    message: response.message,
  };
}
