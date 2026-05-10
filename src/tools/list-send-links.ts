/**
 * KausaLayer MCP - List Send Links Tool
 * List all KausaLink send links created by the user
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { ListSendLinksParams, ListSendLinksResult, SendLinkEntry } from '../types';

export const listSendLinksTool: Tool = {
  name: 'list_send_links',
  description: 'List all KausaLink send links created by the user. Shows active, claimed, expired, and refunded links.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleListSendLinks(
  params: ListSendLinksParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<ListSendLinksResult> {
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  const response = await apiClient.listSendLinks(metaAddress);

  const links: SendLinkEntry[] = response.links.map(l => ({
    id: l.id,
    amount_sol: l.amount_sol,
    label: l.label,
    status: l.status,
    created_at: new Date(l.created_at * 1000).toISOString(),
    expires_at: new Date(l.expires_at * 1000).toISOString(),
    claimed_at: l.claimed_at ? new Date(l.claimed_at * 1000).toISOString() : null,
    link_url: l.link_url,
  }));

  return {
    links,
    count: response.count,
  };
}
