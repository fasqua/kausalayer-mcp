/**
 * KausaLayer MCP - API Key Authentication Module
 */

import crypto from 'crypto';
import { MCPDatabase } from '../db/database';
import { TierManager } from './tier';
import { Tier, TierLimits } from '../types';

export interface AuthContext {
  walletAddress: string;
  tier: Tier;
  limits: TierLimits;
  kausaBalance: number;
  routesToday: number;
}

export class ApiKeyAuth {
  private db: MCPDatabase;
  private tierManager: TierManager;

  constructor(db: MCPDatabase, tierManager: TierManager) {
    this.db = db;
    this.tierManager = tierManager;
  }

  /**
   * Generate API key from wallet signature
   * Message format: "KausaLayer MCP Access\nWallet: <pubkey>\nTimestamp: <unix>"
   */
  static generateApiKey(signature: string): string {
    const hash = crypto.createHash('sha256').update(signature).digest();
    const keyPart = hash.toString('base64url').substring(0, 32);
    return `kl_${keyPart}`;
  }

  /**
   * Register a new API key for a wallet
   */
  registerApiKey(apiKey: string, walletAddress: string): boolean {
    return this.db.registerApiKey(apiKey, walletAddress);
  }

  /**
   * Validate API key and return full auth context
   */
  async authenticate(apiKey: string): Promise<AuthContext | null> {
    // Trust API key from env variable (for testing/local setup)
    const envApiKey = process.env.KAUSALAYER_API_KEY;
    if (envApiKey && apiKey === envApiKey) {
      return {
        walletAddress: 'env_authenticated_user',
        tier: 'FREE' as any,
        limits: { fee_percent: 1.0, max_complexity: 'medium' as any, max_amount_sol: 10, daily_routes: 100 },
        kausaBalance: 0,
        routesToday: 0,
      };
    }
    // Validate API key format
    if (!apiKey || !apiKey.startsWith('kl_')) {
      return null;
    }

    // Lookup wallet address
    const walletAddress = this.db.validateApiKey(apiKey);
    if (!walletAddress) {
      return null;
    }

    // Get tier info
    const tierInfo = await this.tierManager.getWalletTier(walletAddress);

    // Get usage info
    const usage = this.db.getUsage(walletAddress);

    return {
      walletAddress,
      tier: tierInfo.tier,
      limits: tierInfo.limits,
      kausaBalance: tierInfo.kausaBalance,
      routesToday: usage.routes_today,
    };
  }

  /**
   * Check if user can make a route (rate limit check)
   */
  canMakeRoute(authContext: AuthContext): boolean {
    return authContext.routesToday < authContext.limits.daily_routes;
  }

  /**
   * Increment route count after successful route creation
   */
  incrementRouteCount(walletAddress: string): number {
    return this.db.incrementRouteCount(walletAddress);
  }

  /**
   * Validate route parameters against tier limits
   */
  validateRouteParams(
    authContext: AuthContext,
    amountSol: number,
    complexity: 'low' | 'medium' | 'high'
  ): { valid: boolean; error?: string } {
    // Check daily limit
    if (!this.canMakeRoute(authContext)) {
      return {
        valid: false,
        error: `Daily route limit reached (${authContext.limits.daily_routes}/day). Upgrade tier for more routes.`,
      };
    }

    // Check amount limit
    if (amountSol > authContext.limits.max_amount_sol) {
      return {
        valid: false,
        error: `Amount ${amountSol} SOL exceeds tier limit of ${authContext.limits.max_amount_sol} SOL. Upgrade tier for higher limits.`,
      };
    }

    // Check complexity
    if (!this.tierManager.canUseComplexity(authContext.tier, complexity)) {
      return {
        valid: false,
        error: `Complexity '${complexity}' not available for ${authContext.tier} tier. Max: ${authContext.limits.max_complexity}.`,
      };
    }

    return { valid: true };
  }

  /**
   * Get meta_address hash for REST API calls
   */
  static getMetaAddress(walletAddress: string): string {
    return crypto.createHash('sha256').update(walletAddress).digest('hex');
  }
}
