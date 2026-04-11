/**
 * KausaLayer MCP - Maze Route Tool
 * Direct private transfer A -> maze -> B
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { MazeRouteParams, MazeRouteResult, Complexity } from '../types';

export const mazeRouteTool: Tool = {
  name: 'maze_route',
  description:
    'Send SOL privately via dynamic maze routing. ' +
    'Creates a deposit address, routes funds through multiple intermediate wallets, ' +
    'and delivers to destination with no traceable on-chain link. ' +
    'Returns deposit address - send the required amount to initiate the transfer.',
  inputSchema: {
    type: 'object',
    properties: {
      destination: {
        type: 'string',
        description: 'Destination Solana wallet address (base58)',
      },
      amount_sol: {
        type: 'number',
        description: 'Amount of SOL to send (minimum 0.01)',
      },
      complexity: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Privacy level. Low: 5-7 hops. Medium: 8-12 hops. High: 13-20 hops.',
      },
    },
    required: ['destination', 'amount_sol'],
  },
};

export async function handleMazeRoute(
  params: MazeRouteParams,
  authContext: AuthContext,
  apiClient: MazeApiClient,
  auth: ApiKeyAuth
): Promise<MazeRouteResult> {
  const { destination, amount_sol, complexity } = params;

  // Validate minimum amount
  if (amount_sol < 0.01) {
    throw new Error('Minimum transfer amount is 0.01 SOL');
  }

  // Validate destination address format
  if (!destination || destination.length < 32 || destination.length > 44) {
    throw new Error('Invalid destination address');
  }

  // Determine complexity (default to max allowed by tier)
  const effectiveComplexity: Complexity = complexity || authContext.limits.max_complexity;

  // Validate against tier limits
  const validation = auth.validateRouteParams(authContext, amount_sol, effectiveComplexity);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Get meta_address for API call
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  // For now, maze_route uses create_pocket + immediate sweep setup
  // TODO: Add direct /route endpoint to Rust backend
  const response = await apiClient.createPocket(metaAddress, amount_sol, effectiveComplexity);

  if (!response.success) {
    throw new Error('Failed to create route');
  }

  // Increment route count
  auth.incrementRouteCount(authContext.walletAddress);

  // Calculate values
  const feeSol = response.fee_lamports / 1_000_000_000;
  const totalRequired = response.total_deposit / 1_000_000_000;

  // Estimate hops based on complexity
  const hopEstimates: Record<Complexity, number> = {
    low: 6,
    medium: 10,
    high: 15,
  };

  return {
    route_id: response.pocket_id.replace('pocket_', 'route_'),
    deposit_address: response.deposit_address,
    amount_required: totalRequired,
    fee_sol: feeSol,
    estimated_hops: hopEstimates[effectiveComplexity],
    estimated_time_minutes: Math.ceil(hopEstimates[effectiveComplexity] / 3),
    expires_at: new Date(response.expires_at * 1000).toISOString(),
  };
}
