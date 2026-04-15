/**
 * KausaLayer MCP - Maze API Client
 * HTTP client for sdp-mazepocket REST API
 */

import {
  CreatePocketRequest,
  CreatePocketResponse,
  PocketInfo,
  PocketDetailInfo,
  SweepRequest,
  SweepResponse,
  StatusResponse,
  RecoverRequest,
  RecoverResponse,
  MazeConfig,
  Complexity,
} from '../types';

export class MazeApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Convert complexity to maze config
   */
  private complexityToConfig(complexity: Complexity): MazeConfig {
    const configs: Record<Complexity, MazeConfig> = {
      low: { hop_count: 5, delay_pattern: 'random' },
      medium: { hop_count: 8, delay_pattern: 'random' },
      high: { hop_count: 12, delay_pattern: 'fibonacci' },
    };
    return configs[complexity];
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    method: string,
    path: string,
    body?: any,
    query?: Record<string, string>
  ): Promise<T> {
    let url = `${this.baseUrl}${path}`;
    
    if (query) {
      const params = new URLSearchParams(query);
      url += `?${params.toString()}`;
    }

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json() as any;

    if (!response.ok) {
      throw new Error(data.error || `API error: ${response.status}`);
    }

    return data as T;
  }

  // ============ POCKET OPERATIONS ============

  /**
   * Create a new pocket
   */
  async createPocket(
    metaAddress: string,
    amountSol: number,
    complexity: Complexity = 'medium'
  ): Promise<CreatePocketResponse> {
    const mazeConfig = this.complexityToConfig(complexity);
    
    return this.request<CreatePocketResponse>('POST', '/pocket', {
      meta_address: metaAddress,
      amount_sol: amountSol,
      maze_config: mazeConfig,
    });
  }

  /**
   * List all pockets for a user
   */
  async listPockets(metaAddress: string): Promise<{
    success: boolean;
    pockets: PocketInfo[];
    count: number;
  }> {
    return this.request('GET', '/pockets', undefined, {
      meta_address: metaAddress,
    });
  }

  /**
   * Get pocket details (including private key)
   */
  async getPocket(
    pocketId: string,
    metaAddress: string
  ): Promise<{
    success: boolean;
    pocket?: PocketDetailInfo;
    message?: string;
  }> {
    return this.request('GET', `/pocket/${pocketId}`, undefined, {
      meta_address: metaAddress,
    });
  }

  /**
   * Sweep pocket funds to destination
   */
  async sweepPocket(
    pocketId: string,
    metaAddress: string,
    destination: string,
    complexity: Complexity = 'medium'
  ): Promise<SweepResponse> {
    const mazeConfig = this.complexityToConfig(complexity);
    
    return this.request<SweepResponse>('POST', `/pocket/${pocketId}/sweep`, {
      meta_address: metaAddress,
      destination,
      maze_config: mazeConfig,
    });
  }

  /**
   * Delete a pocket (soft delete)
   */
  async deletePocket(
    pocketId: string,
    metaAddress: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request('DELETE', `/pocket/${pocketId}`, {
      meta_address: metaAddress,
    });
  }

  // ============ STATUS OPERATIONS ============

  /**
   * Get funding request status
   */
  async getFundingStatus(requestId: string): Promise<StatusResponse> {
    return this.request<StatusResponse>('GET', `/status/${requestId}`);
  }

  /**
   * Get sweep status
   */
  async getSweepStatus(sweepId: string): Promise<StatusResponse> {
    return this.request<StatusResponse>('GET', `/sweep/${sweepId}/status`);
  }

  // ============ RECOVERY OPERATIONS ============

  /**
   * Resume a failed sweep
   */
  async resumeSweep(sweepId: string): Promise<SweepResponse> {
    return this.request<SweepResponse>('POST', `/sweep/${sweepId}/resume`);
  }

  /**
   * Recover stuck funding
   */
  async recoverFunding(
    pocketId: string,
    metaAddress: string
  ): Promise<RecoverResponse> {
    return this.request<RecoverResponse>('POST', `/pocket/${pocketId}/recover`, {
      meta_address: metaAddress,
    });
  }

  /**
   * Recover stuck sweep
   */
  async recoverSweep(
    sweepId: string,
    metaAddress: string
  ): Promise<RecoverResponse> {
    return this.request<RecoverResponse>('POST', `/sweep/${sweepId}/recover`, {
      meta_address: metaAddress,
    });
  }

  // ============ WALLET OPERATIONS ============

  /**
   * Add destination wallet
   */
  async addWallet(
    metaAddress: string,
    slot: number,
    walletAddress: string
  ): Promise<{ success: boolean; slot: number; wallet_address: string }> {
    return this.request('POST', '/wallet', {
      meta_address: metaAddress,
      slot,
      wallet_address: walletAddress,
    });
  }

  /**
   * List saved wallets
   */
  async listWallets(metaAddress: string): Promise<{
    success: boolean;
    wallets: { slot: number; address: string }[];
  }> {
    return this.request('GET', '/wallets', undefined, {
      meta_address: metaAddress,
    });
  }

  /**
   * Delete saved wallet
   */
  async deleteWallet(
    slot: number,
    metaAddress: string
  ): Promise<{ success: boolean; deleted: boolean }> {
    return this.request('DELETE', `/wallet/${slot}`, undefined, {
      meta_address: metaAddress,
    });
  }

  // ============ STATS ============

  /**
   * Get protocol stats
   */
  async getStats(): Promise<{
    total_nodes_alltime: number;
    total_hops_alltime: number;
    nodes_24h: number;
  }> {
    return this.request('GET', '/stats');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: string;
    service: string;
    version: string;
  }> {
    return this.request('GET', '/health');
  }

  // ============ DIRECT ROUTE ============

  /**
   * Create a direct route (A -> maze -> B)
   */
  async createRoute(
    metaAddress: string,
    amountSol: number,
    destination?: string,
    destinationSlot?: number,
    complexity: Complexity = 'medium'
  ): Promise<{
    success: boolean;
    route_id: string;
    deposit_address: string;
    destination: string;
    amount_lamports: number;
    fee_lamports: number;
    total_deposit: number;
    expires_at: number;
    maze_info: {
      nodes: number;
      levels: number;
      estimated_time_seconds: number;
    };
  }> {
    const mazeConfig = this.complexityToConfig(complexity);
    const body: any = {
      meta_address: metaAddress,
      amount_sol: amountSol,
      maze_config: mazeConfig,
    };
    if (destinationSlot !== undefined) {
      body.destination_slot = destinationSlot;
    } else if (destination) {
      body.destination = destination;
    }
    return this.request("POST", "/route", body);
  }

  // ============ PHASE 1 - POCKET MANAGEMENT ============

  /**
   * Rename a pocket
   */
  async renamePocket(
    pocketId: string,
    metaAddress: string,
    label: string | null
  ): Promise<{ success: boolean; pocket_id: string; label: string | null }> {
    return this.request('POST', `/pocket/${pocketId}/rename`, {
      meta_address: metaAddress,
      label,
    });
  }

  /**
   * Archive/unarchive a pocket
   */
  async archivePocket(
    pocketId: string,
    metaAddress: string,
    archived: boolean
  ): Promise<{ success: boolean; pocket_id: string; archived: boolean }> {
    return this.request('POST', `/pocket/${pocketId}/archive`, {
      meta_address: metaAddress,
      archived,
    });
  }

  // ============ PHASE 2 - HISTORY & STATS ============

  /**
   * Get route history
   */
  async getRouteHistory(
    metaAddress: string,
    limit: number = 50
  ): Promise<{
    success: boolean;
    routes: Array<{
      id: string;
      route_type: string;
      amount_lamports: number;
      amount_sol: number;
      fee_lamports: number;
      status: string;
      destination: string | null;
      created_at: number;
      completed_at: number | null;
      tx_signature: string | null;
    }>;
    count: number;
  }> {
    return this.request('GET', '/route-history', undefined, {
      meta_address: metaAddress,
      limit: limit.toString(),
    });
  }

  /**
   * Get usage stats
   */
  async getUsageStats(metaAddress: string): Promise<{
    success: boolean;
    routes_today: number;
    routes_this_week: number;
    routes_this_month: number;
    total_volume_lamports: number;
    total_volume_sol: number;
  }> {
    return this.request('GET', '/usage-stats', undefined, {
      meta_address: metaAddress,
    });
  }

  /**
   * Get pocket transactions
   */
  async getPocketTransactions(
    pocketId: string,
    metaAddress: string,
    limit: number = 20
  ): Promise<{
    success: boolean;
    pocket_id: string;
    address: string;
    transactions: Array<{
      signature: string;
      slot: number;
      block_time: number | null;
      status: string;
    }>;
    count: number;
  }> {
    return this.request('GET', `/pocket/${pocketId}/transactions`, undefined, {
      meta_address: metaAddress,
      limit: limit.toString(),
    });
  }

  /**
   * Get tier info
   */
  async getTierInfo(
    metaAddress: string,
    walletAddress?: string
  ): Promise<{
    success: boolean;
    current_tier: string;
    kausa_balance: number;
    limits: {
      fee_percent: number;
      max_amount_sol: number;
      daily_routes: number;
    };
    next_tier: string | null;
    kausa_needed: number | null;
    routes_used_today: number;
    routes_remaining_today: number;
  }> {
    const query: Record<string, string> = { meta_address: metaAddress };
    if (walletAddress) {
      query.wallet_address = walletAddress;
    }
    return this.request('GET', '/tier-info', undefined, query);
  }

  // ============ PHASE 3 - SWEEP ALL POCKETS ============

  /**
   * Sweep all pockets to a single destination
   */
  async sweepAllPockets(
    metaAddress: string,
    destination: string,
    complexity: Complexity = "medium",
    destinationSlot?: number
  ): Promise<{
    success: boolean;
    total_pockets: number;
    successful_sweeps: number;
    failed_sweeps: number;
    total_amount_swept: number;
    destination: string;
    results: Array<{
      pocket_id: string;
      success: boolean;
      sweep_id?: string;
      amount_swept?: number;
      error?: string;
    }>;
  }> {
    const mazeConfig = this.complexityToConfig(complexity);

    const body: any = {
      meta_address: metaAddress,
      maze_config: mazeConfig,
    };

    if (destinationSlot !== undefined) {
      body.destination_slot = destinationSlot;
    } else {
      body.destination = destination;
    }

    return this.request("POST", "/pockets/sweep-all", body);
  }
}
