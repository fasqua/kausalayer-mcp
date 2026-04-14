# @kausalayer/mcp

Privacy infrastructure for AI agents on Solana. Route SOL privately via dynamic maze routing.

## Installation

```bash
npm install -g @kausalayer/mcp
```

Or use directly with npx:

```bash
npx @kausalayer/mcp
```

## Quick Start

### 1. Get API Key

Visit https://kausalayer.com/mcp, connect your wallet, and generate an API key.

### 2. Configure Your Client

#### Claude Desktop

Edit `claude_desktop_config.json`:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "kausalayer": {
      "command": "npx",
      "args": ["-y", "@kausalayer/mcp"],
      "env": {
        "KAUSALAYER_API_KEY": "kl_your_api_key_here"
      }
    }
  }
}
```

#### Cursor

Add to MCP settings:

```json
{
  "kausalayer": {
    "command": "npx",
    "args": ["-y", "@kausalayer/mcp"],
    "env": {
      "KAUSALAYER_API_KEY": "kl_your_api_key_here"
    }
  }
}
```

### 3. Start Using

Ask your AI agent:
- "Create a stealth pocket with 0.1 SOL"
- "Route 0.5 SOL to [destination address]"
- "List my pockets"
- "Sweep pocket [pocket_id] to [destination]"
- "Save my main wallet to slot 1"
- "Show my saved wallets"

## Available Tools

| Tool | Description |
|------|-------------|
| `create_pocket` | Create a stealth wallet funded via maze routing |
| `list_pockets` | List all your stealth pockets |
| `get_pocket_info` | Get details about a specific pocket |
| `maze_route` | Route SOL privately (A → maze → B) |
| `sweep_pocket` | Withdraw funds from pocket via maze routing |
| `check_route_status` | Check status of a route |
| `export_pocket_key` | Export private key for wallet import |
| `estimate_fee` | Estimate fees before executing |
| `retry_route` | Retry a failed route |
| `recover_route` | Recover funds from stuck route |
| `list_saved_wallets` | List saved destination wallets (slots 1-5) |
| `add_saved_wallet` | Save a destination wallet to a slot |
| `remove_saved_wallet` | Remove a saved wallet by slot |
| `delete_pocket` | Delete an empty pocket |

## Tier System

Hold $KAUSA tokens to unlock lower fees and higher limits:

| Tier | KAUSA Required | Fee | Daily Routes | Max SOL |
|------|---------------|-----|--------------|---------|
| FREE | 0 | 1.0% | 10 | 1 |
| BASIC | 1,000 | 0.5% | 50 | 10 |
| PRO | 10,000 | 0.25% | 200 | 100 |
| ENTERPRISE | 100,000 | 0.1% | Unlimited | Unlimited |

**KAUSA Token:** `BWXSNRBKMviG68MqavyssnzDq4qSArcN7eNYjqEfpump`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KAUSALAYER_API_KEY` | Yes | Your API key from kausalayer.com/mcp |
| `SOLANA_RPC_URL` | No | Custom RPC endpoint (default: Helius) |

## How It Works

KausaLayer uses dynamic maze routing to break the on-chain link between sender and receiver:

1. **Create Pocket**: Funds are routed through a randomly generated maze of intermediate wallets
2. **Stealth Address**: Each pocket has a unique stealth address derived from your wallet
3. **Maze Routing**: Transactions are split and delayed using golden ratio splits and Fibonacci timing
4. **Privacy**: No direct on-chain link between source and destination

## Links

- Website: https://kausalayer.com
- API Key: https://kausalayer.com/mcp
- GitHub: https://github.com/fasqua/kausalayer-mcp
- Twitter: https://x.com/kausalayer

## License

Apache 2.0
