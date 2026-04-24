/**
 * KausaLayer MCP - Get Sweep Status Tool
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext } from '../auth/api-key';
import { GetSweepStatusParams, GetSweepStatusResult, SweepStatusApiResponse } from '../types';

export const getSweepStatusTool: Tool = {
  name: 'get_sweep_status',
  description: 'Check progress of a sweep operation.',
  inputSchema: {
    type: 'object',
    properties: {
      sweep_id: { type: 'string', description: 'Sweep request ID' },
    },
    required: ['sweep_id'],
  },
};

export async function handleGetSweepStatus(
  params: GetSweepStatusParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<GetSweepStatusResult> {
  const response = await apiClient.getSweepStatus(params.sweep_id);

  return {
    sweep_id: params.sweep_id,
    status: response.status || 'unknown',
    progress: response.progress || undefined,
    destination: response.destination || undefined,
    amount_lamports: response.amount_lamports || undefined,
    error: response.error || undefined,
  };
}
