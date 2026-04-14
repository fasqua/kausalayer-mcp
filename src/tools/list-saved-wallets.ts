/**
 * KausaLayer MCP - List Saved Wallets Tool
 * List all saved destination wallets (slot 1-5)
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { ListSavedWalletsParams, ListSavedWalletsResult } from '../types';

export const listSavedWalletsTool: Tool = {
	name: 'list_saved_wallets',
	description: 'List all saved destination wallets (slots 1-5). These are pre-saved addresses for quick sweep operations.',
	inputSchema: {
		type: 'object',
		properties: {},
	},
};

export async function handleListSavedWallets(
	params: ListSavedWalletsParams,
	authContext: AuthContext,
	apiClient: MazeApiClient
): Promise<ListSavedWalletsResult> {
	// Get meta_address for API call
	const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

	// Call REST API
	const response = await apiClient.listWallets(metaAddress);

	if (!response.success) {
		throw new Error('Failed to list saved wallets');
	}

	return {
		wallets: response.wallets,
		total_count: response.wallets.length,
	};
}
