/**
 * KausaLayer MCP - Database Layer
 * SQLite database for API keys and usage tracking
 */

import Database from 'better-sqlite3';
import crypto from 'crypto';
import path from 'path';
import { ApiKeyRecord, UsageRecord } from '../types';

export class MCPDatabase {
  private db: Database.Database;

  constructor(dbPath: string) {
    const resolvedPath = path.resolve(dbPath);
    this.db = new Database(resolvedPath);
    this.db.pragma('journal_mode = WAL');
    this.initTables();
  }

  /**
   * Initialize database tables
   */
  private initTables(): void {
    // API keys table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS api_keys (
        api_key_hash TEXT PRIMARY KEY,
        wallet_address TEXT NOT NULL UNIQUE,
        created_at INTEGER NOT NULL,
        last_used_at INTEGER NOT NULL
      )
    `);

    // Usage tracking table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS usage (
        wallet_address TEXT PRIMARY KEY,
        routes_today INTEGER DEFAULT 0,
        last_reset_date TEXT NOT NULL
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_api_keys_wallet ON api_keys(wallet_address)
    `);
  }

  /**
   * Hash an API key for storage
   */
  static hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Generate a new API key from wallet signature
   */
  static generateApiKey(signature: string): string {
    const hash = crypto.createHash('sha256').update(signature).digest();
    const keyPart = hash.toString('base64url').substring(0, 32);
    return `kl_${keyPart}`;
  }

  /**
   * Register a new API key
   */
  registerApiKey(apiKey: string, walletAddress: string): boolean {
    const apiKeyHash = MCPDatabase.hashApiKey(apiKey);
    const now = Date.now();

    try {
      const stmt = this.db.prepare(`
        INSERT INTO api_keys (api_key_hash, wallet_address, created_at, last_used_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(wallet_address) DO UPDATE SET
          api_key_hash = excluded.api_key_hash,
          last_used_at = excluded.last_used_at
      `);
      stmt.run(apiKeyHash, walletAddress, now, now);
      return true;
    } catch (error) {
      console.error('Failed to register API key:', error);
      return false;
    }
  }

  /**
   * Validate an API key and return wallet address
   */
  validateApiKey(apiKey: string): string | null {
    const apiKeyHash = MCPDatabase.hashApiKey(apiKey);

    const stmt = this.db.prepare(`
      SELECT wallet_address FROM api_keys WHERE api_key_hash = ?
    `);
    const row = stmt.get(apiKeyHash) as { wallet_address: string } | undefined;

    if (row) {
      // Update last_used_at
      const updateStmt = this.db.prepare(`
        UPDATE api_keys SET last_used_at = ? WHERE api_key_hash = ?
      `);
      updateStmt.run(Date.now(), apiKeyHash);
      return row.wallet_address;
    }

    return null;
  }

  /**
   * Get API key record by wallet address
   */
  getApiKeyByWallet(walletAddress: string): ApiKeyRecord | null {
    const stmt = this.db.prepare(`
      SELECT api_key_hash, wallet_address, created_at, last_used_at
      FROM api_keys WHERE wallet_address = ?
    `);
    const row = stmt.get(walletAddress) as ApiKeyRecord | undefined;
    return row || null;
  }

  /**
   * Get usage for a wallet
   */
  getUsage(walletAddress: string): UsageRecord {
    const today = new Date().toISOString().split('T')[0];

    const stmt = this.db.prepare(`
      SELECT wallet_address, routes_today, last_reset_date
      FROM usage WHERE wallet_address = ?
    `);
    const row = stmt.get(walletAddress) as UsageRecord | undefined;

    if (!row) {
      // Create new usage record
      const insertStmt = this.db.prepare(`
        INSERT INTO usage (wallet_address, routes_today, last_reset_date)
        VALUES (?, 0, ?)
      `);
      insertStmt.run(walletAddress, today);
      return { wallet_address: walletAddress, routes_today: 0, last_reset_date: today };
    }

    // Reset if new day
    if (row.last_reset_date !== today) {
      const updateStmt = this.db.prepare(`
        UPDATE usage SET routes_today = 0, last_reset_date = ? WHERE wallet_address = ?
      `);
      updateStmt.run(today, walletAddress);
      return { ...row, routes_today: 0, last_reset_date: today };
    }

    return row;
  }

  /**
   * Increment route count for a wallet
   */
  incrementRouteCount(walletAddress: string): number {
    const usage = this.getUsage(walletAddress);
    const newCount = usage.routes_today + 1;

    const stmt = this.db.prepare(`
      UPDATE usage SET routes_today = ? WHERE wallet_address = ?
    `);
    stmt.run(newCount, walletAddress);

    return newCount;
  }

  /**
   * Check if wallet can make more routes today
   */
  canMakeRoute(walletAddress: string, dailyLimit: number): boolean {
    const usage = this.getUsage(walletAddress);
    return usage.routes_today < dailyLimit;
  }

  /**
   * Delete an API key
   */
  deleteApiKey(walletAddress: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM api_keys WHERE wallet_address = ?
    `);
    const result = stmt.run(walletAddress);
    return result.changes > 0;
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}
