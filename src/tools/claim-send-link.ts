/**
 * KausaLayer MCP - Claim Send Link Tool
 * Claim a KausaLink send link to receive SOL into a new pocket
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext } from '../auth/api-key';
import { ClaimSendLinkParams, ClaimSendLinkResult } from '../types';

export const claimSendLinkTool: Tool = {
  name: 'claim_send_link',
  description: 'Claim a KausaLink send link. Creates a new pocket for the recipient and routes the funds via maze routing.',
  inputSchema: {
    type: 'object',
    properties: {
      link_id: {
        type: 'string',
        description: 'The send link ID to claim',
      },
      secret: {
        type: 'string',
        description: 'The secret from the link URL',
      },
      wallet_address: {
        type: 'string',
        description: 'The Solana wallet address of the claimer',
      },
      signature: {
        type: 'string',
        description: 'Wallet signature for verification',
      },
      message: {
        type: 'string',
        description: 'The meta_address derived by the frontend',
      },
    },
    required: ['link_id', 'secret', 'wallet_address', 'signature', 'message'],
  },
};

export async function handleClaimSendLink(
  params: ClaimSendLinkParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<ClaimSendLinkResult> {
  const response = await apiClient.claimSendLink(
    params.link_id,
    params.secret,
    params.wallet_address,
    params.signature,
    params.message,
  );

  return {
    success: response.success,
    pocket_id: response.pocket_id,
    meta_address: response.meta_address,
    amount_sol: response.amount_sol,
    message: response.message,
  };
}
