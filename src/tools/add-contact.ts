/**
 * KausaLayer MCP - Add Contact Tool
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { AddContactParams, AddContactResult } from '../types';

export const addContactTool: Tool = {
  name: 'add_contact',
  description: 'Add a contact alias mapped to a pocket ID for easy P2P transfers.',
  inputSchema: {
    type: 'object',
    properties: {
      alias: { type: 'string', description: 'Contact alias (e.g., @bob)' },
      pocket_id: { type: 'string', description: 'Pocket ID for this contact' },
      label: { type: 'string', description: 'Optional description label' },
    },
    required: ['alias', 'pocket_id'],
  },
};

export async function handleAddContact(
  params: AddContactParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<AddContactResult> {
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);
  const response = await apiClient.addContact(metaAddress, params.alias, params.pocket_id, params.label);

  if (!response.success) throw new Error('Failed to add contact');

  return {
    success: true,
    alias: response.alias || params.alias,
    pocket_id: response.pocket_id || params.pocket_id,
  };
}
