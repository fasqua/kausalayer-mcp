/**
 * KausaLayer MCP - Get P2P Status Tool
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext } from '../auth/api-key';
import { GetP2pStatusParams, GetP2pStatusResult } from '../types';

export const getP2pStatusTool: Tool = {
  name: 'get_p2p_status',
  description: 'Check progress of a P2P pocket-to-pocket transfer.',
  inputSchema: {
    type: 'object',
    properties: {
      transfer_id: { type: 'string', description: 'P2P transfer ID' },
    },
    required: ['transfer_id'],
  },
};

export async function handleGetP2pStatus(
  params: GetP2pStatusParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<GetP2pStatusResult> {
  const response = await apiClient.getP2pStatus(params.transfer_id);

  return {
    transfer_id: params.transfer_id,
    status: response.status || 'unknown',
    progress: response.progress || undefined,
    error: response.error || undefined,
  };
}
