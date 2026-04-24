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
- "Route 1 SOL to my saved wallet slot 1"
- "List my pockets"
- "Sweep pocket [pocket_id] to [destination]"
- "Sweep all my pockets to slot 1"
- "Save my main wallet to slot 1"
- "Show my route history"
- "What's my current tier?"

## Available Tools (35)

### Core Tools

| Tool | Description |
|------|-------------|
| `create_pocket` | Create a stealth wallet funded via maze routing |
| `list_pockets` | List all your stealth pockets |
| `get_pocket_info` | Get details about a specific pocket |
| `maze_route` | Route SOL privately (A → maze → B). Supports `destination` or `destination_slot` (1-5) |
| `sweep_pocket` | Withdraw funds from pocket via maze routing |
| `sweep_all_pockets` | Sweep ALL active pockets to single destination via maze routing |
| `check_route_status` | Check status of a route or funding request |
| `get_sweep_status` | Check progress of a sweep operation |
| `export_pocket_key` | Export private key for wallet import |
| `estimate_fee` | Estimate fees before executing |
| `retry_route` | Retry a failed route |
| `recover_route` | Recover funds from stuck route |

### P2P Transfers

| Tool | Description |
|------|-------------|
| `send_to_pocket` | Send SOL from one pocket to another via maze routing |
| `get_p2p_status` | Check progress of a P2P transfer |
| `recover_p2p` | Recover funds stuck in a failed P2P transfer |

### Swap Operations

| Tool | Description |
|------|-------------|
| `swap_quote` | Get a swap quote (expected output, price impact) |
| `swap_execute` | Execute a token swap via Jupiter (SOL to token or token to SOL) |
| `get_token_balances` | Get all token balances (SOL + SPL tokens) for a pocket |
| `get_token_list` | Get list of supported tokens |
| `resolve_token` | Resolve token by symbol or contract address |

### Wallet Management

| Tool | Description |
|------|-------------|
| `list_saved_wallets` | List saved destination wallets (slots 1-5) |
| `add_saved_wallet` | Save a destination wallet to a slot |
| `remove_saved_wallet` | Remove a saved wallet by slot |

### Contacts

| Tool | Description |
|------|-------------|
| `add_contact` | Add a contact alias mapped to a pocket ID |
| `list_contacts` | List all saved contacts |
| `delete_contact` | Delete a contact by alias |

### Pocket Management

| Tool | Description |
|------|-------------|
| `delete_pocket` | Delete an empty pocket |
| `rename_pocket` | Add a label to a pocket for easy identification |
| `archive_pocket` | Archive/unarchive a pocket (hidden from list by default) |

### Analytics & History

| Tool | Description |
|------|-------------|
| `get_route_history` | Get history of all maze routes (funding + sweeps) |
| `get_usage_stats` | Get usage statistics (routes today/week/month, volume) |
| `get_pocket_transactions` | Get transaction history for a specific pocket |
| `get_tier_info` | Get current tier, limits, and upgrade requirements |

### Maze Preferences

| Tool | Description |
|------|-------------|
| `get_maze_preferences` | Get saved maze routing preferences |
| `save_maze_preferences` | Save custom maze routing config (hops, split ratio, delays) |

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
