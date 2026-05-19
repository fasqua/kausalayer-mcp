/**
 * KausaLayer MCP - KausaGate List Tool
 * List all registered endpoints for a pocket
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';

export const kausaGateListTool: Tool = {
  name: 'kausa_gate_list',
  description:
    'List all API endpoints registered to a pocket via KausaGate. ' +
    'Shows endpoint URL, method, price, category, and status for each registration.',
  inputSchema: {
    type: 'object',
    properties: {
      pocket_id: {
        type: 'string',
        description: 'The pocket ID to list endpoints for',
      },
    },
    required: ['pocket_id'],
  },
};

export async function handleKausaGateList(
  params: { pocket_id: string },
  authContext: AuthContext,
  apiClient: MazeApiClient,
  auth: ApiKeyAuth
): Promise<{
  success: boolean;
  pocket_id: string;
  endpoints: Array<{
    id: string;
    endpoint_url: string;
    method: string;
    description: string;
    price_usdc: number;
    category: string;
    yaml_url: string;
  }>;
  count: number;
}> {
  const { pocket_id } = params;
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  const response = await apiClient.gateListByPocket(pocket_id, metaAddress);

  const endpoints = response.endpoints.map(ep => ({
    id: ep.id,
    endpoint_url: ep.endpoint_url,
    method: ep.method,
    description: ep.description,
    price_usdc: ep.price_usdc,
    category: ep.category,
    yaml_url: `https://mazepocket.kausalayer.com/gate/yaml/${ep.id}`,
  }));

  return {
    success: true,
    pocket_id: response.pocket_id,
    endpoints,
    count: endpoints.length,
  };
}
