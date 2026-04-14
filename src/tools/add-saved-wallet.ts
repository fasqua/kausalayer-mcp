/**
 * KausaLayer MCP - Add Saved Wallet Tool
 * Add a destination wallet to a slot (1-5)
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { AddSavedWalletParams, AddSavedWalletResult } from '../types';

export const addSavedWalletTool: Tool = {
	name: 'add_saved_wallet',
	description: 'Save a destination wallet address to a slot (1-5) for quick sweep operations.',
	inputSchema: {
		type: 'object',
		properties: {
			slot: {
				type: 'number',
				description: 'Slot number (1-5)',
				minimum: 1,
				maximum: 5,
			},
			wallet_address: {
				type: 'string',
				description: 'Solana wallet address to save',
			},
		},
		required: ['slot', 'wallet_address'],
	},
};

export async function handleAddSavedWallet(
	params: AddSavedWalletParams,
	authContext: AuthContext,
	apiClient: MazeApiClient
): Promise<AddSavedWalletResult> {
	const { slot, wallet_address } = params;

	// Validate slot
	if (slot < 1 || slot > 5) {
		throw new Error('Slot must be between 1 and 5');
	}

	// Get meta_address for API call
	const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

	// Call REST API
	const response = await apiClient.addWallet(metaAddress, slot, wallet_address);

	if (!response.success) {
		throw new Error('Failed to add saved wallet');
	}

	return {
		success: true,
		slot: response.slot,
		wallet_address: response.wallet_address,
	};
}
