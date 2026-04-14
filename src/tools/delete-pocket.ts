/**
 * KausaLayer MCP - Delete Pocket Tool
 * Delete an empty pocket (soft delete)
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';
import { DeletePocketParams, DeletePocketResult } from '../types';

export const deletePocketTool: Tool = {
	name: 'delete_pocket',
	description: 'Delete an empty pocket. The pocket must have zero balance (sweep first if needed).',
	inputSchema: {
		type: 'object',
		properties: {
			pocket_id: {
				type: 'string',
				description: 'The pocket ID to delete (e.g., pocket_abc123)',
			},
		},
		required: ['pocket_id'],
	},
};

export async function handleDeletePocket(
	params: DeletePocketParams,
	authContext: AuthContext,
	apiClient: MazeApiClient
): Promise<DeletePocketResult> {
	const { pocket_id } = params;

	// Get meta_address for API call
	const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

	// Call REST API
	const response = await apiClient.deletePocket(pocket_id, metaAddress);

	return {
		success: response.success,
		pocket_id,
		message: response.message,
	};
}
