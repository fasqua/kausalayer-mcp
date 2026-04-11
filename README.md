# KausaLayer MCP Server

Privacy infrastructure for AI agents on Solana. Route SOL privately via dynamic maze routing.

> ⚠️ **IN DEVELOPMENT** - This project is under active development and not yet ready for production use. APIs may change without notice.

## Overview

KausaLayer MCP exposes privacy tools via the Model Context Protocol (MCP), enabling AI agents like Claude, Cursor, and custom trading bots to perform private Solana transactions.

## Features

- **maze_route** - Send SOL privately via dynamic maze routing (A → maze → B)
- **create_pocket** - Create stealth wallets funded via maze routing
- **sweep_pocket** - Withdraw funds from pockets via maze routing
- **export_pocket_key** - Export private keys for Phantom/Solflare import
- **estimate_fee** - Estimate fees before executing

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/tools` | GET | List available MCP tools |
| `/register` | POST | Register API key |
| `/call` | POST | Execute a tool |
| `/tier` | GET | Get user tier info |

## Authentication

1. Sign message with your Solana wallet: `KausaLayer MCP Access\nWallet: <pubkey>\nTimestamp: <unix>`
2. POST to `/register` with `wallet_address` and `signature`
3. Receive API key (format: `kl_xxxxxxxx`)
4. Include `x-api-key` header in subsequent requests

## Tier System

| Tier | KAUSA Required | Fee | Daily Routes |
|------|---------------|-----|--------------|
| FREE | 0 | 1.0% | 10 |
| BASIC | 1,000 | 0.5% | 50 |
| PRO | 10,000 | 0.25% | 200 |
| ENTERPRISE | 100,000 | 0.1% | Unlimited |

Hold $KAUSA tokens to unlock lower fees and higher limits.

**KAUSA Token:** `BWXSNRBKMviG68MqavyssnzDq4qSArcN7eNYjqEfpump`

## Usage Example

```bash
# Register API key
curl -X POST https://mcp.kausalayer.com/register \
  -H "Content-Type: application/json" \
  -d '{"wallet_address": "YOUR_PUBKEY", "signature": "YOUR_SIGNATURE"}'

# Estimate fee
curl -X POST https://mcp.kausalayer.com/call \
  -H "Content-Type: application/json" \
  -H "x-api-key: kl_your_api_key" \
  -d '{"tool": "estimate_fee", "arguments": {"amount_sol": 1.0, "operation": "route"}}'

# Create private route
curl -X POST https://mcp.kausalayer.com/call \
  -H "Content-Type: application/json" \
  -H "x-api-key: kl_your_api_key" \
  -d '{"tool": "maze_route", "arguments": {"destination": "DEST_PUBKEY", "amount_sol": 1.0}}'
```

## MCP Client Integration

> 🚧 **Coming Soon** - npm package will be published for easy integration with Claude Desktop, Cursor, and other MCP-compatible clients.

## License

Apache 2.0

## Links

- Website: https://kausalayer.com
- Docs: https://docs.kausalayer.com
- Twitter: https://x.com/kausalayer
