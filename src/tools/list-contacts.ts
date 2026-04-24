/**
 * KausaLayer MCP - List Contacts Tool
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { ListContactsParams, ListContactsResult } from '../types';

export const listContactsTool: Tool = {
  name: 'list_contacts',
  description: 'List all saved contacts with their aliases and pocket IDs.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleListContacts(
  params: ListContactsParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<ListContactsResult> {
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);
  const response = await apiClient.listContacts(metaAddress);

  return {
    contacts: response.contacts || [],
    count: response.count || 0,
  };
}
