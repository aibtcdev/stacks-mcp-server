# Stacks MCP Server

A Model Context Protocol (MCP) server that provides Stacks blockchain functionality for AI assistants like Claude.

## Tools

### Account Management
- **`generate_account`** - Generate a new Stacks account with private key
- **`get_account_balance`** - Check STX balance for any Stacks address

### Blockchain Information  
- **`get_network_status`** - Get current network status and info
- **`get_block_info`** - Get block details by height or hash
- **`get_transaction_info`** - Get transaction details by ID
- **`search_transactions`** - Search transactions by address

### Configuration
- **`check_api_status`** - Check API key status and rate limits

## Quick Start

### Using with Claude Desktop

Add to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "stacks-mcp-server": {
      "command": "npx",
      "args": ["stacks-mcp-server"],
      "env": {
        "STACKS_NETWORK": "testnet"
      }
    }
  }
}
```

### Environment Variables

- **`STACKS_NETWORK`** - Default network: `mainnet`, `testnet`, or `mocknet` (default: `testnet`)
- **`HIRO_API_KEY`** - Optional API key for higher rate limits ([get one here](https://www.hiro.so/))
- **`DEBUG`** - Set to `1` for debug logging

### Example with API Key

```json
{
  "mcpServers": {
    "stacks-mcp-server": {
      "command": "npx", 
      "args": ["stacks-mcp-server"],
      "env": {
        "STACKS_NETWORK": "testnet",
        "HIRO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Usage Examples

Once configured, you can ask Claude:

- "Generate a new Stacks testnet account"
- "Check the balance for address ST1ABC..."  
- "Get the latest block info on mainnet"
- "Search for transactions for address ST1XYZ..."
- "What's the current network status?"

## Networks

- **Testnet**: Safe for development and testing
- **Mainnet**: Production Stacks network  
- **Mocknet**: Local development network

## License

MIT
