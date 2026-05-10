/**
 * KausaLayer MCP - Get Transaction History Tool
 * Get full transaction history across all operation types
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { GetTransactionHistoryParams, GetTransactionHistoryResult, HistoryEntry } from '../types';

export const getTransactionHistoryTool: Tool = {
  name: 'get_transaction_history',
  description: 'Get full transaction history for the user. Includes all operation types: funding, sweep, swap, p2p, kausapay, gate_register, printr, send_link, and send_link_claim. Optionally filter by type.',
  inputSchema: {
    type: 'object',
    properties: {
      tx_type: {
        type: 'string',
        description: 'Optional filter by transaction type (e.g. "funding", "sweep", "swap", "p2p", "kausapay", "send_link", "send_link_claim", "gate_register", "printr")',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of entries to return. Default: 50, Max: 100',
      },
    },
  },
};

export async function handleGetTransactionHistory(
  params: GetTransactionHistoryParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<GetTransactionHistoryResult> {
  const { tx_type, limit = 50 } = params;
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  const response = await apiClient.getTransactionHistory(metaAddress, tx_type, limit);

  const history: HistoryEntry[] = response.history.map(h => ({
    id: h.id,
    tx_type: h.tx_type,
    status: h.status,
    amount_lamports: h.amount_lamports,
    amount_display: h.amount_display,
    tx_signature: h.tx_signature,
    description: h.description,
    created_at: new Date(h.created_at * 1000).toISOString(),
    completed_at: h.completed_at ? new Date(h.completed_at * 1000).toISOString() : null,
    has_proof: h.has_proof,
  }));

  return {
    history,
    count: response.count,
  };
}
