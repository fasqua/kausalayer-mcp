/**
 * KausaLayer MCP - Get Token List Tool
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext } from '../auth/api-key';
import { GetTokenListParams, GetTokenListResult } from '../types';

export const getTokenListTool: Tool = {
  name: 'get_token_list',
  description: 'Get list of supported tokens for swap operations.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleGetTokenList(
  params: GetTokenListParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<GetTokenListResult> {
  const response = await apiClient.getTokenList();

  return {
    tokens: response.tokens || [],
    count: response.count || 0,
  };
}
