/**
 * KausaLayer MCP - Get Send Link Info Tool
 * Get information about a send link (public, no auth required)
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext } from '../auth/api-key';
import { GetSendLinkInfoParams, GetSendLinkInfoResult } from '../types';

export const getSendLinkInfoTool: Tool = {
  name: 'get_send_link_info',
  description: 'Get information about a KausaLink send link. Requires the link ID and secret from the link URL.',
  inputSchema: {
    type: 'object',
    properties: {
      link_id: {
        type: 'string',
        description: 'The send link ID (e.g. link_xxxxxxxx)',
      },
      secret: {
        type: 'string',
        description: 'The secret from the link URL (the "s" query parameter)',
      },
    },
    required: ['link_id', 'secret'],
  },
};

export async function handleGetSendLinkInfo(
  params: GetSendLinkInfoParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<GetSendLinkInfoResult> {
  const response = await apiClient.getSendLinkInfo(
    params.link_id,
    params.secret,
  );

  return {
    amount_sol: response.amount_sol,
    label: response.label,
    status: response.status,
    created_at: new Date(response.created_at * 1000).toISOString(),
  };
}
