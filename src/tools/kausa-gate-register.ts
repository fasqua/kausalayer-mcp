/**
 * KausaLayer MCP - KausaGate Register Tool
 * Register an API endpoint to Pay.sh marketplace via a pocket
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MazeApiClient } from '../api/maze-client';
import { AuthContext, ApiKeyAuth } from '../auth/api-key';

export const kausaGateRegisterTool: Tool = {
  name: 'kausa_gate_register',
  description:
    'Register your API endpoint to Pay.sh marketplace via KausaGate. ' +
    'Generates a Pay.sh YAML spec with your endpoint URL visible (service accountability) ' +
    'but payment recipient is your stealth pocket (financial privacy). ' +
    'Specify the endpoint URL, HTTP method, price per request in USDC, and category.',
  inputSchema: {
    type: 'object',
    properties: {
      pocket_id: {
        type: 'string',
        description: 'The pocket ID to receive revenue from this endpoint',
      },
      endpoint_url: {
        type: 'string',
        description: 'The HTTPS URL of your API endpoint (e.g. https://api.example.com/v1/analyze)',
      },
      method: {
        type: 'string',
        description: 'HTTP method that requires payment (GET or POST). Default: POST.',
        enum: ['GET', 'POST'],
        default: 'POST',
      },
      description: {
        type: 'string',
        description: 'Short description of what this endpoint does',
      },
      price_usdc: {
        type: 'number',
        description: 'Price per request in USDC (e.g. 0.001)',
      },
      category: {
        type: 'string',
        description: 'Endpoint category',
        enum: ['ai_ml', 'search', 'data', 'compute', 'maps', 'productivity'],
        default: 'ai_ml',
      },
    },
    required: ['pocket_id', 'endpoint_url', 'description', 'price_usdc'],
  },
};

export async function handleKausaGateRegister(
  params: {
    pocket_id: string;
    endpoint_url: string;
    method?: string;
    description: string;
    price_usdc: number;
    category?: string;
  },
  authContext: AuthContext,
  apiClient: MazeApiClient,
  auth: ApiKeyAuth
): Promise<{
  success: boolean;
  endpoint_id: string;
  pocket_id: string;
  pocket_address: string;
  yaml_url: string;
  error?: string;
}> {
  const { pocket_id, endpoint_url, method = 'POST', description, price_usdc, category = 'ai_ml' } = params;

  if (!endpoint_url || !endpoint_url.startsWith('https://')) {
    throw new Error('Endpoint URL must start with https://');
  }

  if (price_usdc <= 0) {
    throw new Error('Price must be greater than 0');
  }

  const metaAddress = ApiKeyAuth.getMetaAddress(authContext.walletAddress);

  const response = await apiClient.gateRegister(
    pocket_id,
    metaAddress,
    endpoint_url,
    method,
    description,
    price_usdc,
    category
  );

  if (!response.success) {
    throw new Error(response.error || 'Registration failed');
  }

  return {
    success: true,
    endpoint_id: response.endpoint_id || '',
    pocket_id: response.pocket_id,
    pocket_address: response.pocket_address,
    yaml_url: `https://mazepocket.kausalayer.com/gate/yaml/${response.endpoint_id}`,
  };
}
