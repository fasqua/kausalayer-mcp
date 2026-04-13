/**
 * KausaLayer MCP - Tier Module
 * Check KAUSA token balance and determine user tier
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { Tier, TierLimits, TIER_LIMITS, TIER_THRESHOLDS } from '../types';

// KAUSA token has 6 decimals (pump.fun standard)
const KAUSA_DECIMALS = 6;

export class TierManager {
  private connection: Connection;
  private rpcUrl: string;
  private kausaMint: PublicKey;

  constructor(rpcUrl: string, kausaMint: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.rpcUrl = rpcUrl;
    this.kausaMint = new PublicKey(kausaMint);
  }

  /**
   * Get KAUSA token balance for a wallet
   */
  async getKausaBalance(walletAddress: string): Promise<number> {
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
            { mint: this.kausaMint.toBase58() },
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
      console.error('Error fetching KAUSA balance:', error.message);
      return 0;
    }
  }

  /**
   * Determine tier based on KAUSA balance
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
   * Get full tier info for a wallet
   */
  async getWalletTier(walletAddress: string): Promise<{
    tier: Tier;
    limits: TierLimits;
    kausaBalance: number;
  }> {
    const kausaBalance = await this.getKausaBalance(walletAddress);
    const tier = this.determineTier(kausaBalance);
    const limits = this.getTierLimits(tier);

    return { tier, limits, kausaBalance };
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
