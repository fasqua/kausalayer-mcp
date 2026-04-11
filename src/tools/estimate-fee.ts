/**
 * KausaLayer MCP - Estimate Fee Tool
 * Estimate fees before executing a route
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { AuthContext } from '../auth/api-key';
import { EstimateFeeParams, EstimateFeeResult, Complexity } from '../types';

export const estimateFeeTool: Tool = {
  name: 'estimate_fee',
  description:
    'Estimate the fee for a maze route, pocket creation, or sweep without executing. ' +
    'Returns fee amount, percentage, and estimated hop count.',
  inputSchema: {
    type: 'object',
    properties: {
      amount_sol: {
        type: 'number',
        description: 'Amount in SOL',
      },
      complexity: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Privacy level. Default based on tier.',
      },
      operation: {
        type: 'string',
        enum: ['route', 'pocket', 'sweep'],
        description: 'Type of operation',
      },
    },
    required: ['amount_sol', 'operation'],
  },
};

export async function handleEstimateFee(
  params: EstimateFeeParams,
  authContext: AuthContext
): Promise<EstimateFeeResult> {
  const { amount_sol, complexity, operation } = params;

  // Determine effective complexity
  const effectiveComplexity: Complexity = complexity || authContext.limits.max_complexity;

  // Calculate fee based on tier
  const feePercent = authContext.limits.fee_percent;
  const feeSol = amount_sol * (feePercent / 100);

  // Estimate hops based on complexity
  const hopEstimates: Record<Complexity, number> = {
    low: 6,
    medium: 10,
    high: 15,
  };
  const estimatedHops = hopEstimates[effectiveComplexity];

  // Calculate TX fees (5000 lamports per TX, approximately)
  const txFeeSol = (estimatedHops * 5000) / 1_000_000_000;

  // Total required
  const totalRequired = amount_sol + feeSol + txFeeSol;

  return {
    amount_sol,
    fee_sol: feeSol,
    fee_percent: feePercent,
    total_required: totalRequired,
    estimated_hops: estimatedHops,
    tier: authContext.tier,
  };
}
