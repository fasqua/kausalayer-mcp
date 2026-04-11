/**
 * KausaLayer MCP - Export Pocket Key Tool
 * Export private key for external wallet import
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { ExportPocketKeyParams, ExportPocketKeyResult } from '../types';

export const exportPocketKeyTool: Tool = {
  name: 'export_pocket_key',
  description:
    'Export the private key of a pocket for import into Phantom, Solflare, or other Solana wallets. ' +
    'WARNING: Keep this key safe. Anyone with this key can access the funds.',
  inputSchema: {
    type: 'object',
    properties: {
      pocket_id: {
        type: 'string',
        description: 'The pocket ID to export',
      },
    },
    required: ['pocket_id'],
  },
};

export async function handleExportPocketKey(
  params: ExportPocketKeyParams,
  authContext: AuthContext,
  apiClient: MazeApiClient
): Promise<ExportPocketKeyResult> {
  const { pocket_id } = params;

  // Get meta_address for API call
  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  // Call REST API
  const response = await apiClient.getPocket(pocket_id, metaAddress);

  if (!response.success || !response.pocket) {
    throw new Error(response.message || 'Pocket not found or access denied');
  }

  const pocket = response.pocket;

  const importInstructions = 
    'To import to Phantom:\n' +
    '1. Open Phantom\n' +
    '2. Settings → Add/Connect Wallet\n' +
    '3. Import Private Key\n' +
    '4. Paste the private key above\n\n' +
    'To import to Solflare:\n' +
    '1. Open Solflare\n' +
    '2. Access existing wallet → Private key\n' +
    '3. Paste the private key above';

  return {
    pocket_id: pocket.id,
    public_key: pocket.address,
    private_key: pocket.private_key,
    import_instructions: importInstructions,
  };
}
