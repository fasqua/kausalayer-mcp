/**
 * KausaLayer MCP - Get Proof of Privacy Tool
 * Get cryptographic Proof of Privacy for a maze route
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { GetProofOfPrivacyParams, GetProofOfPrivacyResult } from '../types';

export const getProofOfPrivacyTool: Tool = {
  name: 'get_proof_of_privacy',
  description: 'Get a cryptographic Proof of Privacy for a completed maze route. Shows privacy grade (A-D), hop count, delay pattern, and HMAC signature. Works for funding, sweep, p2p, and send_link routes.',
  inputSchema: {
    type: 'object',
    properties: {
      pocket_id: {
        type: 'string',
        description: 'The pocket ID that owns the route',
      },
      route_id: {
        type: 'string',
        description: 'The route ID (e.g. fund_xxx, sweep_xxx, p2p_xxx, link_xxx)',
      },
    },
    required: ['pocket_id', 'route_id'],
  },
};

export async function handleGetProofOfPrivacy(
  params: GetProofOfPrivacyParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<GetProofOfPrivacyResult> {
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  const response = await apiClient.getProofOfPrivacy(
    params.pocket_id,
    params.route_id,
    metaAddress,
  );

  return {
    proof: response.proof,
    error: response.error,
  };
}
