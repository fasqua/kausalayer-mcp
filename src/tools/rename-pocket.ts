/**
 * KausaLayer MCP - Rename Pocket Tool
 * Rename/label a pocket for easy identification
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { RenamePocketParams, RenamePocketResult } from '../types';

export const renamePocketTool: Tool = {
  name: 'rename_pocket',
  description: 'Rename or label a pocket for easy identification. Set label to null to remove the label.',
  inputSchema: {
    type: 'object',
    properties: {
      pocket_id: {
        type: 'string',
        description: 'The pocket ID to rename',
      },
      label: {
        type: ['string', 'null'],
        description: 'New label for the pocket, or null to remove label',
      },
    },
    required: ['pocket_id', 'label'],
  },
};

export async function handleRenamePocket(
  params: RenamePocketParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<RenamePocketResult> {
  const { pocket_id, label } = params;
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  const response = await apiClient.renamePocket(pocket_id, metaAddress, label);

  return {
    success: response.success,
    pocket_id: response.pocket_id,
    label: response.label,
  };
}
