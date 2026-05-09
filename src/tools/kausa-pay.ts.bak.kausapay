/**
 * KausaLayer MCP - KausaPay Tool
 * Pay x402/MPP endpoints from a pocket
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';

export const kausaPayTool: Tool = {
  name: 'kausa_pay',
  description:
    'Pay an x402 or MPP paywalled endpoint using USDC from a pocket. ' +
    'Probes the URL, auto-detects the payment protocol (x402 v2 or MPP), ' +
    'builds and signs the payment transaction, and returns the unlocked content. ' +
    'The pocket pays with USDC — no SOL needed for gas (facilitator covers fees).',
  inputSchema: {
    type: 'object',
    properties: {
      pocket_id: {
        type: 'string',
        description: 'The pocket ID to pay from (must have USDC balance)',
      },
      url: {
        type: 'string',
        description: 'The HTTPS URL of the x402/MPP paywalled endpoint',
      },
      max_amount_usdc: {
        type: 'number',
        description: 'Maximum USDC amount willing to pay (e.g. 0.01). Payment will fail if endpoint requires more than this.',
        default: 0.01,
      },
    },
    required: ['pocket_id', 'url'],
  },
};

export async function handleKausaPay(
  params: { pocket_id: string; url: string; max_amount_usdc?: number },
  authContext: AuthContext,
  apiClient: MazeApiClient,
  auth: ApiKeyAuth
): Promise<{
  success: boolean;
  protocol: string;
  amount_paid: number;
  token: string;
  tx_signature: string;
  content: string;
  error?: string;
}> {
  const { pocket_id, url, max_amount_usdc = 0.01 } = params;

  // Validate URL
  if (!url || !url.startsWith('https://')) {
    throw new Error('URL must start with https://');
  }

  if (max_amount_usdc <= 0 || max_amount_usdc > 1000) {
    throw new Error('max_amount_usdc must be between 0 and 1000');
  }

  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  const response = await apiClient.kausaPay(
    pocket_id,
    metaAddress,
    url,
    max_amount_usdc
  );

  if (!response.success) {
    throw new Error(response.error || 'Payment failed');
  }

  // Try to extract readable content from response body
  let content = response.response_body || '';
  try {
    const parsed = JSON.parse(content);
    content = parsed.premiumContent || parsed.content || parsed.data || parsed.message || parsed.result || content;
    if (typeof content !== 'string') {
      content = JSON.stringify(content);
    }
  } catch {
    // Keep raw content
  }

  return {
    success: true,
    protocol: response.protocol_used,
    amount_paid: response.amount_paid_usdc,
    token: response.token_symbol,
    tx_signature: response.payment_signature,
    content,
  };
}
