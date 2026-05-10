/**
 * KausaLayer MCP - Create Send Link Tool
 * Create a claimable payment link (KausaLink) from a pocket
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { CreateSendLinkParams, CreateSendLinkResult } from '../types';

export const createSendLinkTool: Tool = {
  name: 'create_send_link',
  description: 'Create a claimable payment link (KausaLink) from a pocket. The link can be shared with anyone to receive SOL via maze routing.',
  inputSchema: {
    type: 'object',
    properties: {
      pocket_id: {
        type: 'string',
        description: 'The pocket ID to fund the send link from',
      },
      amount_sol: {
        type: 'number',
        description: 'Amount of SOL to send via the link',
      },
      label: {
        type: 'string',
        description: 'Optional label for the send link (e.g. "Payment for design work")',
      },
    },
    required: ['pocket_id', 'amount_sol'],
  },
};

export async function handleCreateSendLink(
  params: CreateSendLinkParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<CreateSendLinkResult> {
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  const response = await apiClient.createSendLink(
    metaAddress,
    params.pocket_id,
    params.amount_sol,
    params.label,
  );

  return {
    link_id: response.link_id,
    link_url: response.link_url,
    amount_sol: params.amount_sol,
    expires_at: new Date(response.expires_at * 1000).toISOString(),
  };
}
