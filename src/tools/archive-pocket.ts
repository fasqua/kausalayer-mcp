/**
 * KausaLayer MCP - Archive Pocket Tool
 * Archive or unarchive a pocket
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { ArchivePocketParams, ArchivePocketResult } from '../types';

export const archivePocketTool: Tool = {
  name: 'archive_pocket',
  description: 'Archive or unarchive a pocket. Archived pockets are hidden from list_pockets by default.',
  inputSchema: {
    type: 'object',
    properties: {
      pocket_id: {
        type: 'string',
        description: 'The pocket ID to archive/unarchive',
      },
      archived: {
        type: 'boolean',
        description: 'true to archive, false to unarchive',
      },
    },
    required: ['pocket_id', 'archived'],
  },
};

export async function handleArchivePocket(
  params: ArchivePocketParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<ArchivePocketResult> {
  const { pocket_id, archived } = params;
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  const response = await apiClient.archivePocket(pocket_id, metaAddress, archived);

  return {
    success: response.success,
    pocket_id: response.pocket_id,
    archived: response.archived,
  };
}
