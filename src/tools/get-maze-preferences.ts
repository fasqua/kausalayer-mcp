/**
 * KausaLayer MCP - Get Maze Preferences Tool
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { GetMazePreferencesParams, GetMazePreferencesResult } from '../types';

export const getMazePreferencesTool: Tool = {
  name: 'get_maze_preferences',
  description: 'Get saved maze routing preferences (hop count, split ratio, merge strategy, delays).',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleGetMazePreferences(
  params: GetMazePreferencesParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<GetMazePreferencesResult> {
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);
  const response = await apiClient.getMazePreferences(metaAddress);

  return {
    preferences: response.preferences || null,
  };
}
