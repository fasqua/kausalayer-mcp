/**
 * KausaLayer MCP - Remove Saved Wallet Tool
 * Remove a saved destination wallet by slot
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { RemoveSavedWalletParams, RemoveSavedWalletResult } from '../types';

export const removeSavedWalletTool: Tool = {
	name: 'remove_saved_wallet',
	description: 'Remove a saved destination wallet by slot number (1-5).',
	inputSchema: {
		type: 'object',
		properties: {
			slot: {
				type: 'number',
				description: 'Slot number to remove (1-5)',
				minimum: 1,
				maximum: 5,
			},
		},
		required: ['slot'],
	},
};

export async function handleRemoveSavedWallet(
	params: RemoveSavedWalletParams,
	authContext: AuthContext,
	apiClient: MazeApiClient
): Promise<RemoveSavedWalletResult> {
	const { slot } = params;

	// Validate slot
	if (slot < 1 || slot > 5) {
		throw new Error('Slot must be between 1 and 5');
	}

	// Get meta_address for API call
	const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

	// Call REST API
	const response = await apiClient.deleteWallet(slot, metaAddress);

	return {
		success: response.success,
		deleted: response.deleted,
		slot,
	};
}
