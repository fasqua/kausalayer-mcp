/**
 * KausaLayer MCP - Verify Proof Tool
 * Verify a Proof of Privacy signature (public, no auth)
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext } from '../auth/api-key';
import { VerifyProofParams, VerifyProofResult } from '../types';

export const verifyProofTool: Tool = {
  name: 'verify_proof',
  description: 'Verify a Proof of Privacy HMAC signature. Confirms whether the proof was genuinely issued by KausaLayer. No authentication required.',
  inputSchema: {
    type: 'object',
    properties: {
      proof: {
        type: 'object',
        description: 'The full Proof of Privacy JSON object to verify',
      },
    },
    required: ['proof'],
  },
};

export async function handleVerifyProof(
  params: VerifyProofParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<VerifyProofResult> {
  const response = await apiClient.verifyProof(params.proof);

  return {
    valid: response.valid,
    proof_id: response.proof_id,
    route_type: response.route_type,
    privacy_grade: response.privacy_grade,
    message: response.message,
  };
}
