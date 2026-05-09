/**
 * KausaLayer MCP - KausaGate Remove Tool
 * Remove a registered endpoint from Pay.sh marketplace
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';

export const kausaGateRemoveTool: Tool = {
  name: 'kausa_gate_remove',
  description:
    'Remove an API endpoint registration from KausaGate. ' +
    'The endpoint will no longer be accessible or payable through Pay.sh.',
  inputSchema: {
    type: 'object',
    properties: {
      pocket_id: {
        type: 'string',
        description: 'The pocket ID the endpoint is registered to',
      },
      endpoint_url: {
        type: 'string',
        description: 'The endpoint URL to remove',
      },
    },
    required: ['pocket_id', 'endpoint_url'],
  },
};

export async function handleKausaGateRemove(
  params: { pocket_id: string; endpoint_url: string },
  authContext: AuthContext,
  apiClient: MazeApiClient,
  auth: ApiKeyAuth
): Promise<{
  success: boolean;
  message: string;
}> {
  const { pocket_id, endpoint_url } = params;

  if (!endpoint_url) {
    throw new Error('endpoint_url is required');
  }

  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  const response = await apiClient.gateDelete(pocket_id, metaAddress, endpoint_url);

  if (!response.success) {
    throw new Error(response.message || 'Failed to remove endpoint');
  }

  return {
    success: true,
    message: response.message,
  };
}
