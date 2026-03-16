> **This repository has been archived.** Development has moved to [aibtc-mcp-server](https://github.com/aibtcdev/aibtc-mcp-server).

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
**Windows:** `%APPDATA%\Claude