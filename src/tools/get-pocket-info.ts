/**
 * KausaLayer MCP - Get Pocket Info Tool
 * Get pocket status and balance (no private key)
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { GetPocketInfoParams, GetPocketInfoResult } from '../types';

export const getPocketInfoTool: Tool = {
  name: 'get_pocket_info',
  description:
    'Get detailed information about a pocket including status and current balance. ' +
    'Does not return private key - use export_pocket_key for that.',
  inputSchema: {
    type: 'object',
    properties: {
      pocket_id: {
        type: 'string',
        description: 'The pocket ID (e.g., pocket_xxxxxxxx)',
      },
    },
    required: ['pocket_id'],
  },
};

export async function handleGetPocketInfo(
  params: GetPocketInfoParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<GetPocketInfoResult> {
  const { pocket_id } = params;

  // Get meta_address for API call
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  // Call REST API
  const response = await apiClient.getPocket(pocket_id, metaAddress);

  if (!response.success || !response.pocket) {
    throw new Error(response.message || 'Pocket not found or access denied');
  }

  const pocket = response.pocket;

  return {
    pocket_id: pocket.id,
    address: pocket.address,
    balance_sol: pocket.balance_sol,
    status: pocket.status,
    created_at: new Date(pocket.created_at * 1000).toISOString(),
  };
}
