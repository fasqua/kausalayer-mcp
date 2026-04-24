/**
 * KausaLayer MCP - Resolve Token Tool
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext } from '../auth/api-key';
import { ResolveTokenParams, ResolveTokenResult } from '../types';

export const resolveTokenTool: Tool = {
  name: 'resolve_token',
  description: 'Resolve a token by symbol, name, or contract address. Returns token details.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Token symbol (USDC, BONK) or contract address' },
    },
    required: ['query'],
  },
};

export async function handleResolveToken(
  params: ResolveTokenParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<ResolveTokenResult> {
  const response = await apiClient.resolveToken(params.query);

  return {
    success: response.success || false,
    token: response.token || undefined,
    error: response.error || undefined,
  };
}
