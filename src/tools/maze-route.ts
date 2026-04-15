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
      destination_slot: {
        type: "number",
        description: "Saved wallet slot (1-5) to route to (alternative to destination)",
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
    required: ['amount_sol'],
  },
};

export async function handleMazeRoute(
  params: MazeRouteParams,
  authContext: AuthContext,
  apiClient: MazeApiClient,
  auth: ApiKeyAuth
): Promise<MazeRouteResult> {
  const { destination, destination_slot, amount_sol, complexity } = params;

  // Validate minimum amount
  if (amount_sol < 0.01) {
    throw new Error('Minimum transfer amount is 0.01 SOL');
  }

  // Validate that either destination_slot or destination is provided
  if (destination_slot === undefined && !destination) {
    throw new Error("Must specify either destination_slot (1-5) or destination address");
  }

  // Validate destination_slot range
  if (destination_slot !== undefined && (destination_slot < 1 || destination_slot > 5)) {
    throw new Error("Invalid slot. Must be 1-5");
  }

  // Validate destination address format if provided
  if (destination && (destination.length < 32 || destination.length > 44)) {
    throw new Error("Invalid destination address");
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
  // Check daily route limit
  const usageStats = await apiClient.getUsageStats(metaAddress);
  const dailyLimit = authContext.limits.daily_routes;
  
  if (usageStats.routes_today >= dailyLimit) {
    throw new Error(`Daily route limit reached (${dailyLimit}/day for ${authContext.tier} tier). Try again tomorrow or upgrade your tier by holding more KAUSA.`);
  }


  // Use direct route endpoint
  
  const response = await apiClient.createRoute(metaAddress, amount_sol, destination, destination_slot, effectiveComplexity);

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
    route_id: response.route_id,
    deposit_address: response.deposit_address,
    amount_required: totalRequired,
    fee_sol: feeSol,
    estimated_hops: hopEstimates[effectiveComplexity],
    estimated_time_minutes: Math.ceil(hopEstimates[effectiveComplexity] / 3),
    expires_at: new Date(response.expires_at * 1000).toISOString(),
  };
}
