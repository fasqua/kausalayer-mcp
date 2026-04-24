/**
 * KausaLayer MCP - Send to Pocket Tool (P2P Transfer)
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { SendToPocketParams, SendToPocketResult, Complexity } from '../types';

export const sendToPocketTool: Tool = {
  name: 'send_to_pocket',
  description:
    'Send SOL from one pocket to another pocket via maze routing (P2P transfer). ' +
    'Both pockets must be active. Funds are routed through maze for privacy.',
  inputSchema: {
    type: 'object',
    properties: {
      pocket_id: { type: 'string', description: 'Sender pocket ID' },
      recipient_pocket_id: { type: 'string', description: 'Recipient pocket ID' },
      amount_sol: { type: 'number', description: 'Amount of SOL to send (min 0.01)' },
      complexity: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Privacy level' },
    },
    required: ['pocket_id', 'recipient_pocket_id', 'amount_sol'],
  },
};

export async function handleSendToPocket(
  params: SendToPocketParams,
  authContext: AuthContext,
  apiClient: MazeApiClient,
  auth: ApiKeyAuth
): Promise<SendToPocketResult> {
  const { pocket_id, recipient_pocket_id, amount_sol, complexity } = params;

  if (amount_sol < 0.01) throw new Error('Minimum amount is 0.01 SOL');
  if (pocket_id === recipient_pocket_id) throw new Error('Cannot send to same pocket');

  if (!auth.canMakeRoute(authContext)) {
    throw new Error(`Daily route limit reached (${authContext.limits.daily_routes}/day).`);
  }

  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);
  const effectiveComplexity: Complexity = complexity || authContext.limits.max_complexity;

  const response = await apiClient.sendToPocket(
    pocket_id, metaAddress, recipient_pocket_id, amount_sol, effectiveComplexity
  );

  if (!response.success) throw new Error(response.error || 'P2P transfer failed');

  auth.incrementRouteCount(authContext.walletAddress);

  return {
    transfer_id: response.transfer_id || '',
    amount_sol,
    fee_sol: (response.fee_lamports || 0) / 1_000_000_000,
    status: response.status || 'processing',
    maze_info: response.maze_info || { nodes: 0, levels: 0, estimated_time_seconds: 0 },
  };
}
