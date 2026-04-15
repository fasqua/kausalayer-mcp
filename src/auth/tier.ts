/**
 * KausaLayer MCP - Tier Module
 * Check token balances and determine user tier
 * Supports multiple tokens via dynamic config from backend
 */
import { Connection, PublicKey } from '@solana/web3.js';
import { Tier, TierLimits, TIER_LIMITS, TIER_THRESHOLDS } from '../types';

// Config cache
interface MasterTokenConfig {
  symbol: string;
  mint: string;
  thresholds: {
    BASIC: number;
    PRO: number;
    ENTERPRISE: number;
  };
  minimum_for_partner_unlock: number;
}

interface PartnerTokenConfig {
  symbol: string;
  mint: string;
  thresholds: {
    BASIC: number;
    PRO: number;
  };
  max_tier: string;
  is_official: boolean;
}

interface TierConfig {
  master_token: MasterTokenConfig;
  partner_tokens: PartnerTokenConfig[];
  limits: Record<string, TierLimits>;
}
export class TierManager {
  private connection: Connection;
  private rpcUrl: string;
  private kausaMint: PublicKey;
  private mazeApiUrl: string;
  private configCache: TierConfig | null = null;
  private configCacheTime: number = 0;
  private readonly CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(rpcUrl: string, kausaMint: string, mazeApiUrl?: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.rpcUrl = rpcUrl;
    this.kausaMint = new PublicKey(kausaMint);
    this.mazeApiUrl = mazeApiUrl || 'http://localhost:3033';
  }

  /**
   * Fetch tier config from backend
   */
  async fetchTierConfig(): Promise<TierConfig | null> {
    // Return cached config if still valid
    const now = Date.now();
    if (this.configCache && (now - this.configCacheTime) < this.CONFIG_CACHE_TTL) {
      return this.configCache;
    }

    try {
      const response = await fetch(`${this.mazeApiUrl}/tier-config`);
      if (!response.ok) {
        console.error('Failed to fetch tier config:', response.status);
        return null;
      }
      const config = await response.json() as TierConfig;
      this.configCache = config;
      this.configCacheTime = now;
      return config;
    } catch (error: any) {
      console.error('Error fetching tier config:', error.message);
      return null;
    }
  }

  /**
   * Get token balance for a wallet
   */
  async getTokenBalance(walletAddress: string, mintAddress: string): Promise<number> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            walletAddress,
            { mint: mintAddress },
            { encoding: 'jsonParsed' }
          ]
        })
      });

      const data: any = await response.json();
      if (data.result?.value?.length > 0) {
        const tokenAmount = data.result.value[0].account.data.parsed.info.tokenAmount;
        return Number(tokenAmount.uiAmount);
      }
      return 0;
    } catch (error: any) {
      console.error('Error fetching token balance:', error.message);
      return 0;
    }
  }

  /**
   * Get KAUSA token balance for a wallet (backward compatible)
   */
  async getKausaBalance(walletAddress: string): Promise<number> {
    return this.getTokenBalance(walletAddress, this.kausaMint.toBase58());
  }

  /**
   * Determine tier based on token balance and thresholds
   */
  determineTierFromBalance(balance: number, thresholds: { BASIC: number; PRO: number; ENTERPRISE: number }): Tier {
    if (balance >= thresholds.ENTERPRISE) {
      return Tier.ENTERPRISE;
    }
    if (balance >= thresholds.PRO) {
      return Tier.PRO;
    }
    if (balance >= thresholds.BASIC) {
      return Tier.BASIC;
    }
    return Tier.FREE;
  }

  /**
   * Determine tier based on KAUSA balance (backward compatible)
   */
  determineTier(kausaBalance: number): Tier {
    if (kausaBalance >= TIER_THRESHOLDS[Tier.ENTERPRISE]) {
      return Tier.ENTERPRISE;
    }
    if (kausaBalance >= TIER_THRESHOLDS[Tier.PRO]) {
      return Tier.PRO;
    }
    if (kausaBalance >= TIER_THRESHOLDS[Tier.BASIC]) {
      return Tier.BASIC;
    }
    return Tier.FREE;
  }

  /**
   * Get tier limits for a tier
   */
  getTierLimits(tier: Tier): TierLimits {
    return TIER_LIMITS[tier];
  }

  /**
   * Compare tiers and return the higher one
   */
  private compareTiers(tier1: Tier, tier2: Tier): Tier {
    const tierOrder = [Tier.FREE, Tier.BASIC, Tier.PRO, Tier.ENTERPRISE];
    const index1 = tierOrder.indexOf(tier1);
    const index2 = tierOrder.indexOf(tier2);
    return index1 >= index2 ? tier1 : tier2;
  }

  /**
   * Get full tier info for a wallet (supports multiple tokens with KAUSA as master key)
   */
  async getWalletTier(walletAddress: string): Promise<{
    tier: Tier;
    limits: TierLimits;
    kausaBalance: number;
  }> {
    // Try to fetch dynamic config
    const config = await this.fetchTierConfig();

    let highestTier: Tier = Tier.FREE;
    let kausaBalance = 0;

    if (config && config.master_token) {
      // New config format with master_token and partner_tokens
      
      // Step 1: Check KAUSA (master token) balance
      kausaBalance = await this.getTokenBalance(walletAddress, config.master_token.mint);
      const kausaTier = this.determineTierFromBalance(kausaBalance, config.master_token.thresholds);
      highestTier = kausaTier;

      // Step 2: Check if KAUSA meets minimum for partner unlock
      const minForPartner = config.master_token.minimum_for_partner_unlock || 100;
      
      if (kausaBalance >= minForPartner && config.partner_tokens && config.partner_tokens.length > 0) {
        // User has enough KAUSA to unlock partner token tiers
        for (const partner of config.partner_tokens) {
          const balance = await this.getTokenBalance(walletAddress, partner.mint);
          
          if (balance > 0) {
            // Determine tier from partner token (only BASIC and PRO available)
            let partnerTier: Tier = Tier.FREE;
            if (balance >= partner.thresholds.PRO) {
              partnerTier = Tier.PRO; // Capped at PRO
            } else if (balance >= partner.thresholds.BASIC) {
              partnerTier = Tier.BASIC;
            }
            
            // Compare and take highest (but partner tokens capped at PRO)
            highestTier = this.compareTiers(highestTier, partnerTier);
          }
        }
      }
    } else if (config && (config as any).tokens && (config as any).tokens.length > 0) {
      // Legacy config format (backward compatibility)
      for (const token of (config as any).tokens) {
        const balance = await this.getTokenBalance(walletAddress, token.mint);
        const tier = this.determineTierFromBalance(balance, token.thresholds);
        highestTier = this.compareTiers(highestTier, tier);
        if (token.symbol === 'KAUSA') {
          kausaBalance = balance;
        }
      }
    } else {
      // Fallback to original KAUSA-only logic
      kausaBalance = await this.getKausaBalance(walletAddress);
      highestTier = this.determineTier(kausaBalance);
    }

    const limits = this.getTierLimits(highestTier);
    return { tier: highestTier, limits, kausaBalance };
  }

  /**
   * Validate if user can use a specific complexity level
   */
  canUseComplexity(tier: Tier, requestedComplexity: 'low' | 'medium' | 'high'): boolean {
    const limits = TIER_LIMITS[tier];
    const complexityOrder = ['low', 'medium', 'high'];
    const maxIndex = complexityOrder.indexOf(limits.max_complexity);
    const requestedIndex = complexityOrder.indexOf(requestedComplexity);
    return requestedIndex <= maxIndex;
  }

  /**
   * Validate if amount is within tier limits
   */
  isAmountAllowed(tier: Tier, amountSol: number): boolean {
    const limits = TIER_LIMITS[tier];
    return amountSol <= limits.max_amount_sol;
  }

  /**
   * Get fee percentage for tier
   */
  getFeePercent(tier: Tier): number {
    return TIER_LIMITS[tier].fee_percent;
  }

  /**
   * Calculate fee in SOL
   */
  calculateFee(tier: Tier, amountSol: number): number {
    const feePercent = this.getFeePercent(tier);
    return amountSol * (feePercent / 100);
  }
}
