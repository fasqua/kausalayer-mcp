/**
 * KausaLayer MCP - Download Proof Tool
 * Download Proof of Privacy as JSON
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { DownloadProofParams, DownloadProofResult } from '../types';

export const downloadProofTool: Tool = {
  name: 'download_proof',
  description: 'Download a Proof of Privacy as a JSON object. Can be shared with third parties to verify privacy without revealing transaction details.',
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

export async function handleDownloadProof(
  params: DownloadProofParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<DownloadProofResult> {
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  const proof = await apiClient.downloadProof(
    params.pocket_id,
    params.route_id,
    metaAddress,
  );

  return {
    proof,
    filename: `${proof.proof_id || params.route_id}.json`,
  };
}
