/**
 * KausaLayer MCP - Swap Execute Tool
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { SwapExecuteParams, SwapExecuteResult } from '../types';

export const swapExecuteTool: Tool = {
  name: 'swap_execute',
  description:
    'Execute a token swap via Jupiter. Swap SOL to any token or token back to SOL. ' +
    'Use token symbol (USDC, BONK) or contract address.',
  inputSchema: {
    type: 'object',
    properties: {
      pocket_id: { type: 'string', description: 'Pocket ID to swap from' },
      output_token: { type: 'string', description: 'Output token symbol or mint address' },
      amount_sol: { type: 'number', description: 'Amount of SOL to swap' },
      slippage_bps: { type: 'number', description: 'Slippage in basis points (default: 300)' },
      input_token: { type: 'string', description: 'Input token for sell (omit for SOL)' },
      amount_raw: { type: 'number', description: 'Raw token amount for sell' },
    },
    required: ['pocket_id', 'output_token', 'amount_sol'],
  },
};

export async function handleSwapExecute(
  params: SwapExecuteParams,
  authContext: AuthContext,
  apiClient: MazeApiClient,
  auth: ApiKeyAuth
): Promise<SwapExecuteResult> {
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  if (!auth.canMakeRoute(authContext)) {
    throw new Error(`Daily route limit reached (${authContext.limits.daily_routes}/day).`);
  }

  const response = await apiClient.swapExecute(
    params.pocket_id, metaAddress, params.output_token, params.amount_sol,
    params.slippage_bps, params.input_token, params.amount_raw
  );

  if (!response.success) throw new Error(response.error || 'Swap failed');

  auth.incrementRouteCount(authContext.walletAddress);

  const result = response.swap_result || {};
  return {
    success: result.success || false,
    tx_signature: result.tx_signature || null,
    input_amount: result.in_amount || '0',
    output_amount: result.out_amount || '0',
    input_mint: result.input_mint || '',
    output_mint: result.output_mint || '',
    error: result.error || null,
  };
}
