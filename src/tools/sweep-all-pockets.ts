/**
 * KausaLayer MCP - Sweep All Pockets Tool
 * Sweep all active pockets to a single destination via maze routing
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { SweepAllPocketsParams, SweepAllPocketsResult, Complexity } from '../types';

export const sweepAllPocketsTool: Tool = {
  name: 'sweep_all_pockets',
  description:
    'Sweep ALL active pockets to a single destination via maze routing. ' +
    'Each pocket is swept through its own maze route for privacy. ' +
    'Use destination_slot (1-5) for saved wallets, or destination for direct address.',
  inputSchema: {
    type: 'object',
    properties: {
      destination_slot: {
        type: 'number',
        description: 'Saved wallet slot (1-5) to sweep all pockets to',
      },
      destination: {
        type: 'string',
        description: 'Destination Solana wallet address (if not using slot)',
      },
      complexity: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Privacy level for all sweeps. Default based on tier.',
      },
    },
    required: [],
  },
};

export async function handleSweepAllPockets(
  params: SweepAllPocketsParams,
  authContext: AuthContext,
  apiClient: MazeApiClient,
  auth: ApiKeyAuth
): Promise<SweepAllPocketsResult> {
  const { destination_slot, destination, complexity } = params;

  // Validate that either destination_slot or destination is provided
  if (destination_slot === undefined && !destination) {
    throw new Error('Must specify either destination_slot (1-5) or destination address');
  }

  // Validate destination_slot range
  if (destination_slot !== undefined && (destination_slot < 1 || destination_slot > 5)) {
    throw new Error('Invalid slot. Must be 1-5');
  }

  // Validate destination address format if provided
  if (destination && (destination.length < 32 || destination.length > 44)) {
    throw new Error('Invalid destination address');
  }

  // Determine complexity (default to max allowed by tier)
  const effectiveComplexity: Complexity = complexity || authContext.limits.max_complexity;

  // Validate complexity
  if (complexity && !auth.canUseComplexity(authContext.tier, complexity)) {
    throw new Error(`Complexity '${complexity}' not available for ${authContext.tier} tier. Max: ${authContext.limits.max_complexity}.`);
  }

  // Get meta_address for API call
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  // Call REST API
  const response = await apiClient.sweepAllPockets(
    metaAddress,
    destination || '',
    effectiveComplexity,
    destination_slot
  );

  if (!response.success && response.total_pockets === 0) {
    throw new Error('No active pockets to sweep');
  }

  // Convert results to SOL
  const resultsInSol = response.results.map(r => ({
    pocket_id: r.pocket_id,
    success: r.success,
    sweep_id: r.sweep_id,
    amount_sol: r.amount_swept ? r.amount_swept / 1_000_000_000 : undefined,
    error: r.error,
  }));

  return {
    total_pockets: response.total_pockets,
    successful_sweeps: response.successful_sweeps,
    failed_sweeps: response.failed_sweeps,
    total_amount_sol: response.total_amount_swept / 1_000_000_000,
    destination: response.destination,
    results: resultsInSol,
  };
}
