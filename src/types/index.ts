/**
 * KausaLayer MCP - Type Definitions
 */

// ============ TIERS ============

export enum Tier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export interface TierLimits {
  fee_percent: number;
  max_complexity: 'low' | 'medium' | 'high';
  max_amount_sol: number;
  daily_routes: number;
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  [Tier.FREE]: {
    fee_percent: 1.0,
    max_complexity: 'low',
    max_amount_sol: 1,
    daily_routes: 10,
  },
  [Tier.BASIC]: {
    fee_percent: 0.5,
    max_complexity: 'medium',
    max_amount_sol: 10,
    daily_routes: 50,
  },
  [Tier.PRO]: {
    fee_percent: 0.25,
    max_complexity: 'high',
    max_amount_sol: 100,
    daily_routes: 200,
  },
  [Tier.ENTERPRISE]: {
    fee_percent: 0.1,
    max_complexity: 'high',
    max_amount_sol: Infinity,
    daily_routes: Infinity,
  },
};

// KAUSA token thresholds for each tier
export const TIER_THRESHOLDS: Record<Tier, number> = {
  [Tier.FREE]: 0,
  [Tier.BASIC]: 1_000,
  [Tier.PRO]: 10_000,
  [Tier.ENTERPRISE]: 100_000,
};

// ============ API KEY ============

export interface ApiKeyRecord {
  api_key_hash: string;
  wallet_address: string;
  created_at: number;
  last_used_at: number;
}

export interface UsageRecord {
  wallet_address: string;
  routes_today: number;
  last_reset_date: string;
}

// ============ MAZE API TYPES ============

export type Complexity = 'low' | 'medium' | 'high';

export interface MazeConfig {
  hop_count?: number;
  split_ratio?: number;
  merge_strategy?: string;
  delay_pattern?: string;
  delay_ms?: number;
  delay_scope?: string;
}

// Route (direct transfer)
export interface CreateRouteRequest {
  meta_address: string;
  destination: string;
  amount_sol: number;
  maze_config?: MazeConfig;
}

export interface CreateRouteResponse {
  success: boolean;
  route_id: string;
  deposit_address: string;
  amount_lamports: number;
  fee_lamports: number;
  total_deposit: number;
  expires_at: number;
  maze_info: {
    nodes: number;
    levels: number;
    estimated_time_seconds: number;
  };
}

// Pocket
export interface CreatePocketRequest {
  meta_address: string;
  amount_sol: number;
  maze_config?: MazeConfig;
}

export interface CreatePocketResponse {
  success: boolean;
  pocket_id: string;
  deposit_address: string;
  amount_lamports: number;
  fee_lamports: number;
  total_deposit: number;
  expires_at: number;
  maze_info: {
    nodes: number;
    levels: number;
    estimated_time_seconds: number;
  };
}

export interface PocketInfo {
  id: string;
  address: string;
  balance_lamports: number;
  balance_sol: number;
  status: string;
  created_at: number;
  funding_amount_lamports: number;
}

export interface PocketDetailInfo extends PocketInfo {
  private_key: string;
  last_sweep_at?: number;
}

// Sweep
export interface SweepRequest {
  meta_address: string;
  destination_slot?: number;
  destination?: string;
  maze_config?: MazeConfig;
}

export interface SweepResponse {
  success: boolean;
  sweep_id?: string;
  message: string;
  amount_swept?: number;
  destination?: string;
  tx_signature?: string;
}

// Status
export interface MazeProgress {
  completed_nodes: number;
  total_nodes: number;
  current_level: number;
  total_levels: number;
  percentage: number;
}

export interface StatusResponse {
  success: boolean;
  request_id: string;
  status: string;
  progress?: MazeProgress;
  error?: string;
  tx_signature?: string;
}

// Recovery
export interface RecoverRequest {
  meta_address: string;
}

export interface RecoverResponse {
  success: boolean;
  message: string;
  recovered_lamports?: number;
  recovered_sol?: number;
  tx_signatures: string[];
}

// ============ MCP TOOL PARAMS ============

export interface MazeRouteParams {
  destination: string;
  amount_sol: number;
  complexity?: Complexity;
}

export interface CreatePocketParams {
  amount_sol: number;
  complexity?: Complexity;
  label?: string;
}

export interface GetPocketInfoParams {
  pocket_id: string;
}

export interface ExportPocketKeyParams {
  pocket_id: string;
}

export interface SweepPocketParams {
  pocket_id: string;
  destination: string;
  complexity?: Complexity;
}

export interface ListPocketsParams {
  status?: 'all' | 'active' | 'pending' | 'swept';
}

export interface CheckRouteStatusParams {
  route_id: string;
}

export interface RetryRouteParams {
  route_id: string;
}

export interface RecoverRouteParams {
  route_id: string;
  destination?: string;
}

export interface EstimateFeeParams {
  amount_sol: number;
  complexity?: Complexity;
  operation: 'route' | 'pocket' | 'sweep';
}

// ============ MCP TOOL RETURNS ============

export interface MazeRouteResult {
  route_id: string;
  deposit_address: string;
  amount_required: number;
  fee_sol: number;
  estimated_hops: number;
  estimated_time_minutes: number;
  expires_at: string;
}

export interface CreatePocketResult {
  pocket_id: string;
  deposit_address: string;
  amount_required: number;
  fee_sol: number;
  expires_at: string;
}

export interface GetPocketInfoResult {
  pocket_id: string;
  label?: string;
  address: string;
  balance_sol: number;
  status: string;
  created_at: string;
}

export interface ExportPocketKeyResult {
  pocket_id: string;
  public_key: string;
  private_key: string;
  import_instructions: string;
}

export interface SweepPocketResult {
  sweep_id: string;
  amount_sol: number;
  fee_sol: number;
  destination: string;
  estimated_time_minutes: number;
}

export interface ListPocketsResult {
  pockets: GetPocketInfoResult[];
  total_count: number;
}

export interface CheckRouteStatusResult {
  route_id: string;
  status: string;
  progress?: {
    completed_nodes: number;
    total_nodes: number;
    current_level: number;
    total_levels: number;
    percentage: number;
  };
  error?: string;
  tx_signature?: string;
}

export interface RetryRouteResult {
  route_id: string;
  status: string;
  resumed_from_node?: number;
  message: string;
}

export interface RecoverRouteResult {
  recovered_sol: number;
  destination: string;
  tx_signatures: string[];
  message: string;
}

export interface EstimateFeeResult {
  amount_sol: number;
  fee_sol: number;
  fee_percent: number;
  total_required: number;
  estimated_hops: number;
  tier: string;
}

// ============ PHASE 0 - WALLET & DELETE TOOLS ============

// Params
export interface ListSavedWalletsParams {}

export interface AddSavedWalletParams {
	slot: number;
	wallet_address: string;
}

export interface RemoveSavedWalletParams {
	slot: number;
}

export interface DeletePocketParams {
	pocket_id: string;
}

// Results
export interface SavedWalletInfo {
	slot: number;
	address: string;
}

export interface ListSavedWalletsResult {
	wallets: SavedWalletInfo[];
	total_count: number;
}

export interface AddSavedWalletResult {
	success: boolean;
	slot: number;
	wallet_address: string;
}

export interface RemoveSavedWalletResult {
	success: boolean;
	deleted: boolean;
	slot: number;
}

export interface DeletePocketResult {
	success: boolean;
	pocket_id: string;
	message: string;
}
