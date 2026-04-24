/**
 * KausaLayer MCP - Recover P2P Transfer Tool
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { RecoverP2pParams, RecoverP2pResult } from '../types';

export const recoverP2pTool: Tool = {
  name: 'recover_p2p',
  description: 'Recover funds stuck in a failed P2P transfer maze nodes.',
  inputSchema: {
    type: 'object',
    properties: {
      transfer_id: { type: 'string', description: 'P2P transfer ID to recover' },
    },
    required: ['transfer_id'],
  },
};

export async function handleRecoverP2p(
  params: RecoverP2pParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<RecoverP2pResult> {
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);
  const response = await apiClient.recoverP2p(params.transfer_id, metaAddress);

  if (!response.success) throw new Error(response.message || 'P2P recovery failed');

  return {
    recovered_sol: (response.recovered_lamports || 0) / 1_000_000_000,
    tx_signatures: response.tx_signatures || [],
    message: response.message,
  };
}
