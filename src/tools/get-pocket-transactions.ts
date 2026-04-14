/**
 * KausaLayer MCP - Get Pocket Transactions Tool
 * Get transaction history for a specific pocket
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { GetPocketTransactionsParams, GetPocketTransactionsResult, TransactionInfo } from '../types';

export const getPocketTransactionsTool: Tool = {
  name: 'get_pocket_transactions',
  description: 'Get transaction history (signatures) for a specific pocket from Solana blockchain.',
  inputSchema: {
    type: 'object',
    properties: {
      pocket_id: {
        type: 'string',
        description: 'The pocket ID to get transactions for',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of transactions to return. Default: 20, Max: 50',
      },
    },
    required: ['pocket_id'],
  },
};

export async function handleGetPocketTransactions(
  params: GetPocketTransactionsParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<GetPocketTransactionsResult> {
  const { pocket_id, limit = 20 } = params;
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  const response = await apiClient.getPocketTransactions(pocket_id, metaAddress, limit);

  const transactions: TransactionInfo[] = response.transactions.map(tx => ({
    signature: tx.signature,
    slot: tx.slot,
    block_time: tx.block_time ? new Date(tx.block_time * 1000).toISOString() : null,
    status: tx.status as 'success' | 'failed',
  }));

  return {
    pocket_id: response.pocket_id,
    address: response.address,
    transactions,
    count: response.count,
  };
}
