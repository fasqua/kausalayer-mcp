/**
 * KausaLayer MCP - Sweep Pocket Tool
 * Withdraw all funds from pocket via maze routing
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { SweepPocketParams, SweepPocketResult, Complexity } from '../types';

export const sweepPocketTool: Tool = {
  name: 'sweep_pocket',
  description:
    'Withdraw all funds from a pocket via maze routing to a destination wallet. ' +
    'Funds are routed through multiple hops for privacy before arriving at destination.',
  inputSchema: {
    type: 'object',
    properties: {
      pocket_id: {
        type: 'string',
        description: 'The pocket ID to sweep',
      },
      destination: {
        type: 'string',
        description: 'Destination Solana wallet address',
      },
      complexity: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Privacy level for the sweep. Default based on tier.',
      },
    },
    required: ['pocket_id', 'destination'],
  },
};

export async function handleSweepPocket(
  params: SweepPocketParams,
  authContext: AuthContext,
  apiClient: MazeApiClient,
  auth: ApiKeyAuth
): Promise<SweepPocketResult> {
  const { pocket_id, destination, complexity } = params;

  // Validate destination address format (basic check)
  if (!destination || destination.length < 32 || destination.length > 44) {
    throw new Error('Invalid destination address');
  }

  // Determine complexity (default to max allowed by tier)
  const effectiveComplexity: Complexity = complexity || authContext.limits.max_complexity;

  // Get meta_address for API call
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  // Call REST API
  const response = await apiClient.sweepPocket(
    pocket_id,
    metaAddress,
    destination,
    effectiveComplexity
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to initiate sweep');
  }

  // Increment route count
  auth.incrementRouteCount(authContext.walletAddress);

  // Calculate amounts in SOL
  const amountSol = (response.amount_swept || 0) / 1_000_000_000;
  const feeSol = amountSol * (authContext.limits.fee_percent / 100);

  return {
    sweep_id: response.sweep_id || '',
    amount_sol: amountSol,
    fee_sol: feeSol,
    destination: response.destination || destination,
    estimated_time_minutes: 3, // Approximate based on complexity
  };
}
