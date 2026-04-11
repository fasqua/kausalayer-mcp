/**
 * KausaLayer MCP - List Pockets Tool
 * List all user's pockets
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { ListPocketsParams, ListPocketsResult, GetPocketInfoResult } from '../types';

export const listPocketsTool: Tool = {
  name: 'list_pockets',
  description: 'List all pockets owned by the user.',
  inputSchema: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['all', 'active', 'pending', 'swept'],
        description: 'Filter by status. Default: all',
      },
    },
  },
};

export async function handleListPockets(
  params: ListPocketsParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<ListPocketsResult> {
  const { status } = params;

  // Get meta_address for API call
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  // Call REST API
  const response = await apiClient.listPockets(metaAddress);

  if (!response.success) {
    throw new Error('Failed to list pockets');
  }

  // Filter by status if specified
  let pockets = response.pockets;
  if (status && status !== 'all') {
    pockets = pockets.filter(p => p.status === status);
  }

  // Transform to result format
  const result: GetPocketInfoResult[] = pockets.map(p => ({
    pocket_id: p.id,
    address: p.address,
    balance_sol: p.balance_sol,
    status: p.status,
    created_at: new Date(p.created_at * 1000).toISOString(),
  }));

  return {
    pockets: result,
    total_count: result.length,
  };
}
