/**
 * KausaLayer MCP - Save Maze Preferences Tool
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { SaveMazePreferencesParams, SaveMazePreferencesResult } from '../types';

export const saveMazePreferencesTool: Tool = {
  name: 'save_maze_preferences',
  description:
    'Save custom maze routing preferences. These apply to all future operations. ' +
    'Configure hop count (5-10), split ratio (1.1-3.0), merge strategy, delay pattern, and timing.',
  inputSchema: {
    type: 'object',
    properties: {
      hop_count: { type: 'number', description: 'Number of hops (5-10)' },
      split_ratio: { type: 'number', description: 'Split complexity (1.1-3.0)' },
      merge_strategy: { type: 'string', enum: ['early', 'late', 'middle', 'random', 'fibonacci'], description: 'Merge strategy' },
      delay_pattern: { type: 'string', enum: ['none', 'linear', 'exponential', 'random', 'fibonacci'], description: 'Delay pattern' },
      delay_ms: { type: 'number', description: 'Base delay in milliseconds (0-5000)' },
      delay_scope: { type: 'string', enum: ['node', 'level'], description: 'Delay scope' },
    },
  },
};

export async function handleSaveMazePreferences(
  params: SaveMazePreferencesParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<SaveMazePreferencesResult> {
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);
  const response = await apiClient.saveMazePreferences(metaAddress, params);

  if (!response.success) throw new Error(response.error || 'Failed to save preferences');

  return { success: true };
}
