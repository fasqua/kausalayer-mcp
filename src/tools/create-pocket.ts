/**
 * KausaLayer MCP - Create Pocket Tool
 * Create a stealth wallet funded via maze routing
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { CreatePocketParams, CreatePocketResult, Complexity } from '../types';

export const createPocketTool: Tool = {
  name: 'create_pocket',
  description: 
    'Create a stealth wallet (pocket) funded via maze routing. ' +
    'The pocket has no on-chain link to your original wallet and can be exported to Phantom/Solflare. ' +
    'Returns a deposit address - send the required amount to fund the pocket.',
  inputSchema: {
    type: 'object',
    properties: {
      amount_sol: {
        type: 'number',
        description: 'Amount of SOL to fund the pocket (minimum 0.05)',
      },
      complexity: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Privacy level. Low: 5-7 hops. Medium: 8-12 hops. High: 13-20 hops. Default based on tier.',
      },
      label: {
        type: 'string',
        description: 'Optional label for this pocket (e.g., "trading", "nft")',
      },
    },
    required: ['amount_sol'],
  },
};

export async function handleCreatePocket(
  params: CreatePocketParams,
  authContext: AuthContext,
  apiClient: MazeApiClient,
  auth: ApiKeyAuth
): Promise<CreatePocketResult> {
  const { amount_sol, complexity, label } = params;

  // Validate minimum amount
  if (amount_sol < 0.05) {
    throw new Error('Minimum pocket funding amount is 0.05 SOL');
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

  // Call REST API
  const response = await apiClient.createPocket(metaAddress, amount_sol, effectiveComplexity);

  if (!response.success) {
    throw new Error('Failed to create pocket');
  }

  // Increment route count
  auth.incrementRouteCount(authContext.walletAddress);

  // Calculate fee in SOL
  const feeSol = response.fee_lamports / 1_000_000_000;
  const totalRequired = response.total_deposit / 1_000_000_000;

  return {
    pocket_id: response.pocket_id,
    deposit_address: response.deposit_address,
    amount_required: totalRequired,
    fee_sol: feeSol,
    expires_at: new Date(response.expires_at * 1000).toISOString(),
  };
}
