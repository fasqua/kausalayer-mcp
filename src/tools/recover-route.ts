/**
 * KausaLayer MCP - Recover Route Tool
 * Recover stuck funds directly to destination
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { RecoverRouteParams, RecoverRouteResult } from '../types';

export const recoverRouteTool: Tool = {
  name: 'recover_route',
  description:
    'Recover funds stuck in a failed route. ' +
    'Transfers directly to destination, bypassing remaining maze hops. ' +
    'Use this when retry_route fails or for funding issues.',
  inputSchema: {
    type: 'object',
    properties: {
      route_id: {
        type: 'string',
        description: 'The route ID to recover (fund_xxx, pocket_xxx, or sweep_xxx)',
      },
      destination: {
        type: 'string',
        description: 'Override destination address (optional, defaults to original)',
      },
    },
    required: ['route_id'],
  },
};

export async function handleRecoverRoute(
  params: RecoverRouteParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<RecoverRouteResult> {
  const { route_id, destination } = params;

  // Get meta_address for API call
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  let response;

  // Determine which recovery endpoint to call
  if (route_id.startsWith('sweep_')) {
    response = await apiClient.recoverSweep(route_id, metaAddress);
  } else {
    // Extract pocket_id from route_id
    let pocketId = route_id;
    if (route_id.startsWith('fund_')) {
      pocketId = 'pocket_' + route_id.substring(5);
    }
    response = await apiClient.recoverFunding(pocketId, metaAddress);
  }

  if (!response.success) {
    throw new Error(response.message || 'Failed to recover funds');
  }

  const recoveredSol = (response.recovered_lamports || 0) / 1_000_000_000;

  return {
    recovered_sol: recoveredSol,
    destination: destination || 'original destination',
    tx_signatures: response.tx_signatures,
    message: response.message,
  };
}
