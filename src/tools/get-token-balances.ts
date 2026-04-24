/**
 * KausaLayer MCP - Get Token Balances Tool
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { GetTokenBalancesParams, GetTokenBalancesResult } from '../types';

export const getTokenBalancesTool: Tool = {
  name: 'get_token_balances',
  description: 'Get all token balances (SOL + SPL tokens) for a pocket.',
  inputSchema: {
    type: 'object',
    properties: {
      pocket_id: { type: 'string', description: 'Pocket ID to check balances' },
    },
    required: ['pocket_id'],
  },
};

export async function handleGetTokenBalances(
  params: GetTokenBalancesParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<GetTokenBalancesResult> {
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);
  const response = await apiClient.getTokenBalances(params.pocket_id, metaAddress);

  if (!response.success) throw new Error(response.error || 'Failed to get token balances');

  return {
    pocket_id: response.pocket_id,
    sol_balance: response.sol_balance || 0,
    tokens: response.tokens || [],
  };
}
