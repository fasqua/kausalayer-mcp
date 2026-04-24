/**
 * KausaLayer MCP - Delete Contact Tool
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { DeleteContactParams, DeleteContactResult } from '../types';

export const deleteContactTool: Tool = {
  name: 'delete_contact',
  description: 'Delete a contact by alias.',
  inputSchema: {
    type: 'object',
    properties: {
      alias: { type: 'string', description: 'Contact alias to delete (e.g., @bob)' },
    },
    required: ['alias'],
  },
};

export async function handleDeleteContact(
  params: DeleteContactParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<DeleteContactResult> {
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);
  const response = await apiClient.deleteContact(params.alias, metaAddress);

  return {
    success: response.success || false,
    deleted: response.deleted || false,
  };
}
