/**
 * KausaLayer MCP - Swap Quote Tool
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { SwapQuoteParams, SwapQuoteResult } from '../types';

export const swapQuoteTool: Tool = {
  name: 'swap_quote',
  description:
    'Get a swap quote before executing. Shows expected output amount and price impact. ' +
    'Use token symbol (USDC, BONK) or contract address.',
  inputSchema: {
    type: 'object',
    properties: {
      pocket_id: { type: 'string', description: 'Pocket ID to swap from' },
      output_token: { type: 'string', description: 'Output token symbol or mint address' },
      amount_sol: { type: 'number', description: 'Amount of SOL to swap' },
      slippage_bps: { type: 'number', description: 'Slippage tolerance in basis points (default: 300)' },
    },
    required: ['pocket_id', 'output_token', 'amount_sol'],
  },
};

export async function handleSwapQuote(
  params: SwapQuoteParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<SwapQuoteResult> {
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  const response = await apiClient.swapQuote(
    params.pocket_id, metaAddress, params.output_token, params.amount_sol, params.slippage_bps
  );

  if (!response.success) throw new Error(response.error || 'Swap quote failed');

  return {
    input_amount: response.quote?.in_amount || '0',
    output_amount: response.quote?.out_amount || '0',
    input_mint: response.quote?.input_mint || '',
    output_mint: response.quote?.output_mint || '',
    price_impact: response.quote?.price_impact_pct || null,
    output_token: response.output_token || null,
  };
}
