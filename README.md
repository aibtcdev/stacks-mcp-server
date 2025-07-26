# Stacks MCP Server

A Model Context Protocol (MCP) server that provides basic Stacks blockchain functionality through the Stacks.js library.

## Features

### Account Management
- Generate new Stacks accounts with private keys
- Check STX balances and account information
- Support for mainnet, testnet, and mocknet

### Network Information
- Get network status and blockchain info
- Query block information by height or hash
- Access network-specific configurations

### Transaction Queries
- Query transaction status and details by transaction ID
- Search transactions by address
- Get transaction history

## Installation & Setup

### Option 1: Use with npx (Recommended)

```bash
# Run directly with npx (no installation needed)
npx stacks-mcp-server

# Or run with environment variables
HIRO_API_KEY=your_key npx stacks-mcp-server

# Run with debug mode
DEBUG=1 npx stacks-mcp-server
```

### Option 2: Install globally

```bash
# Install globally
npm install -g stacks-mcp-server

# Run from anywhere
stacks-mcp-server

# Or run with environment variables
HIRO_API_KEY=your_key stacks-mcp-server
```

### Option 3: Local development

```bash
# Clone and build from source
git clone https://github.com/aibtcdev/stacks-mcp-server.git
cd stacks-mcp-server

# Install dependencies
npm install

# Run the server (builds automatically)
npm start

# Or run in development mode
npm run dev

# For development with file watching
npm run watch
```

## Using with LLM Clients

### Claude Desktop (Recommended)

The easiest way to use this MCP server is with Claude Desktop, which has built-in MCP support.

#### macOS Configuration

1. **Locate the config file:**
   ```
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

2. **Add the server configuration (choose one option):**

   **Option A: Using npx (Recommended - no installation needed)**
   ```json
   {
     "mcpServers": {
       "stacks-mcp-server": {
         "command": "npx",
         "args": ["stacks-mcp-server"],
         "env": {
           "HIRO_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

   **Option B: Using global installation**
   ```json
   {
     "mcpServers": {
       "stacks-mcp-server": {
         "command": "stacks-mcp-server",
         "env": {
           "HIRO_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

   **Option C: Using local build (for development)**
   ```json
   {
     "mcpServers": {
       "stacks-mcp-server": {
         "command": "node",
         "args": ["/path/to/your/hiro-mcp-server/build/index.js"],
         "cwd": "/path/to/your/hiro-mcp-server",
         "env": {
           "HIRO_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

#### Windows Configuration

1. **Locate the config file:**
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```

2. **Add the server configuration (choose one option):**

   **Option A: Using npx (Recommended)**
   ```json
   {
     "mcpServers": {
       "stacks-mcp-server": {
         "command": "npx",
         "args": ["stacks-mcp-server"],
         "env": {
           "HIRO_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

   **Option B: Using global installation**
   ```json
   {
     "mcpServers": {
       "stacks-mcp-server": {
         "command": "stacks-mcp-server",
         "env": {
           "HIRO_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

   **Option C: Using local build (for development)**
   ```json
   {
     "mcpServers": {
       "stacks-mcp-server": {
         "command": "node",
         "args": ["C:\\path\\to\\your\\hiro-mcp-server\\build\\index.js"],
         "cwd": "C:\\path\\to\\your\\hiro-mcp-server",
         "env": {
           "HIRO_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

#### Using in Claude Desktop

Once configured, restart Claude Desktop and you'll see:
- 🔌 MCP connection indicator 
- Access to all Stacks tools via natural language
- Example: "Generate a new Stacks testnet account for me"

### MCP Inspector (Development & Testing)

For development and testing, use the MCP Inspector:

```bash
# Start the inspector
npm run inspector

# This opens http://localhost:6274 in your browser
# Use the web interface to test all tools and resources
```

### Other MCP-Compatible Clients

#### Continue.dev

[Continue.dev](https://continue.dev/) supports MCP servers through configuration:

1. **Add to `.continue/config.json`:**
   ```json
   {
     "mcpServers": [
       {
         "name": "stacks-mcp-server",
         "command": "node",
         "args": ["/path/to/your/hiro-mcp-server/build/index.js"]
       }
     ]
   }
   ```

#### Cursor (via MCP extension)

If using Cursor with MCP support:

1. **Install MCP extension**
2. **Configure in settings:**
   ```json
   {
     "mcp.servers": {
       "stacks-mcp-server": {
         "command": "node",
         "args": ["/path/to/your/hiro-mcp-server/build/index.js"]
       }
     }
   }
   ```

#### Custom Integration (Any LLM)

For custom integrations, you can run the server and communicate via stdio:

```bash
# Start the server
node build/index.js

# The server accepts JSON-RPC 2.0 messages over stdin/stdout
# Example message:
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node build/index.js
```

## Testing Your Setup

### 1. Verify Installation

```bash
# Ensure the server builds without errors
npm run build

# Test with inspector
npm run inspector
```

### 2. Test in Claude Desktop

Try these example prompts:

```
"Show me the available Stacks networks"
"Check my API status and rate limits"
"Generate a new testnet account"
"Check the balance for address ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
"Get the latest block information on testnet"
"Search for transactions for a specific address"
```

### 3. Test Environment Variables

```bash
# Test with debug logging
DEBUG=1 npm run dev

# Test with API key
HIRO_API_KEY=your_key npm start

# Test with custom endpoints
HIRO_TESTNET_API_URL=https://custom-endpoint.com npm run dev

# Test all configurations
DEBUG=1 HIRO_API_KEY=your_key npm run validate
```

### 3. Verify Tools Are Available

In Claude Desktop, you should see responses that use the MCP tools, indicated by:
- Structured data responses
- References to "using the Stacks MCP server"
- Real blockchain data from the APIs

## Troubleshooting

### Common Issues

#### 1. "Server not found" or "Command not found"
- **Issue**: Incorrect path in configuration
- **Solution**: Use absolute paths in your config. Find your current directory:
  ```bash
  pwd  # Shows current directory
  ls build/index.js  # Verify the file exists
  ```

#### 2. "Module not found" errors
- **Issue**: Dependencies not installed or TypeScript compilation failed
- **Solution**: 
  ```bash
  npm install
  npm run typecheck  # Check for TypeScript errors
  npm test  # This will build and test
  ```

#### 3. MCP Server not appearing in Claude Desktop
- **Issue**: Configuration syntax or Claude restart needed
- **Solution**:
  - Validate JSON syntax in config file
  - Restart Claude Desktop completely
  - Check Claude Desktop logs for errors

#### 4. API timeouts or network errors
- **Issue**: Network connectivity to Stacks APIs
- **Solution**:
  - Check internet connection
  - Try switching networks (testnet vs mainnet)
  - Verify Stacks API status at [status.hiro.so](https://status.hiro.so)

#### 5. Rate limit errors (429 status)
- **Issue**: Too many API requests hitting rate limits
- **Solution**:
  - Get a Hiro API key at [hiro.so](https://www.hiro.so/) for higher limits
  - Add `HIRO_API_KEY=your_key` to your `.env` file
  - Use `check_api_status` tool to verify your configuration
  - Implement request throttling in your application

#### 6. Invalid API key
- **Issue**: Authentication errors with API key
- **Solution**:
  - Verify your API key is correct in the `.env` file
  - Check that the API key hasn't expired
  - Use `check_api_status` tool to test connectivity
  - Regenerate API key if necessary

### Debug Mode

Run the server in debug mode to see detailed logs:

```bash
# Run with debug logging
DEBUG=1 node build/index.js

# Or use the inspector for interactive debugging
npm run inspector
```

### Validation Commands

```bash
# Run full test suite (builds automatically)
npm test

# Validate with MCP inspector (builds automatically)
npm run inspector

# Check TypeScript compilation
npm run typecheck

# Validate tools are accessible (builds automatically)
npm run validate

# Test API key configuration (builds automatically)
DEBUG=1 npm run validate

# Run in development mode
npm run dev
```

## Available Tools

### `generate_account`
Generate a new Stacks account with a private key.

**Parameters:**
- `network` (optional): "mainnet", "testnet", or "mocknet" (default: "testnet")

### `get_account_balance`
Get STX balance and account information for a Stacks address.

**Parameters:**
- `address` (required): Stacks address to check
- `network` (optional): Network to query (default: "testnet")

### `get_transaction_info`
Get information about a transaction by ID.

**Parameters:**
- `txId` (required): Transaction ID to look up
- `network` (optional): Network to query (default: "testnet")

### `get_block_info`
Get information about a specific block.

**Parameters:**
- `blockId` (required): Block hash or height to look up
- `network` (optional): Network to query (default: "testnet")

### `get_network_status`
Get current network status and blockchain information.

**Parameters:**
- `network` (optional): Network to query (default: "testnet")

### `search_transactions`
Search for transactions by address.

**Parameters:**
- `address` (required): Address to search transactions for
- `limit` (optional): Maximum number of transactions to return (default: 10)
- `network` (optional): Network to query (default: "testnet")

### `check_api_status`
Check API key status, configuration, and rate limits.

**Parameters:**
- `include_limits` (optional): Include rate limit information (default: true)

## Available Resources

- `stacks://networks` - Available Stacks network configurations
- `stacks://network-info/testnet` - Current testnet information  
- `stacks://network-info/mainnet` - Current mainnet information

## Available Prompts

- `stacks_overview` - Overview of available capabilities
- `getting_started_guide` - Guide for getting started with Stacks

## Getting Started

1. **Check Network Status**
   ```
   get_network_status(network: "testnet")
   ```

2. **Generate an Account**
   ```
   generate_account(network: "testnet")
   ```

3. **Fund Your Account**
   - For testnet: Use the [Stacks testnet faucet](https://explorer.hiro.so/sandbox/faucet)
   - Enter your testnet address to receive test STX

4. **Check Your Balance**
   ```
   get_account_balance(address: "your_address", network: "testnet")
   ```

5. **Explore Blockchain Data**
   - View blocks: `get_block_info(blockId: "123", network: "testnet")`
   - Search transactions: `search_transactions(address: "your_address", network: "testnet")`

## Important Notes

- Always use testnet for development and testing
- Keep private keys secure and never share them
- This server provides read-only blockchain access
- For sending transactions, additional Stacks.js integration would be needed

## Networks

- **Mainnet**: `https://api.mainnet.hiro.so` - Production Stacks network
- **Testnet**: `https://api.testnet.hiro.so` - Test network for development
- **Mocknet**: `http://localhost:3999` - Local development network

## Dependencies

This server uses the following Stacks.js libraries:
- `@stacks/transactions` - Transaction handling
- `@stacks/network` - Network configurations
- `@stacks/blockchain-api-client` - API client for blockchain data
- `@stacks/auth` - Authentication utilities
- `@stacks/storage` - Decentralized storage
- `@stacks/connect` - Wallet connectivity
- `@stacks/stacking` - Stacking functionality
- `@stacks/encryption` - Encryption utilities

## Advanced Usage

### Multiple Client Setup

You can use this MCP server with multiple clients simultaneously:

```json
{
  "mcpServers": {
    "stacks-mcp-server": {
      "command": "node",
      "args": ["/path/to/hiro-mcp-server/build/index.js"],
      "cwd": "/path/to/hiro-mcp-server"
    },
    "other-server": {
      "command": "other-mcp-server"
    }
  }
}
```

### Environment Variables

You can customize the server behavior with environment variables. Create a `.env` file in your project root:

```bash
# Hiro API Key (optional) - Get yours at https://www.hiro.so/
# Benefits: Higher rate limits, dedicated support channels
HIRO_API_KEY=your_api_key_here

# Custom API endpoints (optional)
HIRO_MAINNET_API_URL=https://api.mainnet.hiro.so
HIRO_TESTNET_API_URL=https://api.testnet.hiro.so
HIRO_MOCKNET_API_URL=http://localhost:3999

# Enable debug logging
DEBUG=1

# API request timeout in milliseconds (default: 30000)
MCP_SERVER_TIMEOUT=30000
```

#### Using Environment Variables

**Option 1: .env file (Recommended)**
```bash
# Create .env file
cat > .env << EOF
HIRO_API_KEY=your_api_key_here
DEBUG=1
EOF

# Run the server
node build/index.js
```

**Option 2: Inline environment variables**
```bash
# Run with environment variables
HIRO_API_KEY=your_key DEBUG=1 node build/index.js
```

#### Getting a Hiro API Key

1. Visit [Hiro.so](https://www.hiro.so/) to sign up for an account
2. Navigate to your dashboard to generate an API key
3. Add your API key to the `.env` file or environment variables
4. Restart the MCP server to apply changes

Benefits of using a Hiro API key:
- **Higher rate limits** for API requests
- **Dedicated support channels** 
- **Priority access** to new features
- **Enhanced reliability** for production applications

### Integration Examples

#### With Claude Desktop
```
User: "Generate a new Stacks account for testing"
Claude: Using the Stacks MCP server to generate a new testnet account...
[Returns account details with private key and address]
```

#### With Continue.dev
```typescript
// In your IDE, use natural language:
// "Check the balance of this Stacks address: ST1ABC..."
// Continue will use the MCP server to fetch real balance data
```

#### Programmatic Usage
```javascript
const { spawn } = require('child_process');

const server = spawn('node', ['build/index.js']);

// Send MCP request
server.stdin.write(JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "generate_account",
    arguments: { network: "testnet" }
  }
}));
```

### Production Considerations

- **Security**: Never expose private keys in logs
- **Rate Limiting**: Be mindful of API rate limits
- **Error Handling**: Implement proper error handling for network failures
- **Monitoring**: Monitor API availability and response times

## Automated Publishing with GitHub Actions

This project uses GitHub Actions for automated CI/CD. Every push triggers tests, and every release automatically publishes to npm.

### Continuous Integration

The CI workflow runs on:
- **Push to main branch**: Full test suite on Node.js 18.x, 20.x, and 22.x
- **Pull requests**: Same comprehensive testing
- **Package validation**: Ensures the package can be built and packed correctly

### Automated Publishing

When you create a GitHub release, the workflow automatically:

1. ✅ **Runs comprehensive tests** on multiple Node.js versions
2. 🔧 **Builds the TypeScript project**
3. 📝 **Updates package.json** with the release version
4. 📦 **Publishes to npm** (excluding development files)
5. 💬 **Comments on the release** with installation instructions

### Setup Instructions

#### 1. Fork and Set Up Repository

1. **Fork this repository** to your GitHub account
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/stacks-mcp-server.git
   cd stacks-mcp-server
   ```

3. **Update package name** in `package.json` (if publishing your own version):
   ```json
   {
     "name": "your-unique-stacks-mcp-server",
     "version": "0.1.0"
   }
   ```

#### 2. Set Up npm Publishing

1. **Create an npm account** at [npmjs.com](https://www.npmjs.com/)

2. **Generate an npm access token:**
   - Visit: https://www.npmjs.com/settings/YOUR_USERNAME/tokens/new
   - **Token type:** Automation
   - **Name:** GitHub Actions (or similar)
   - **Copy the generated token** 🔑

3. **Add npm token to GitHub secrets:**
   - Go to your repository: `Settings` → `Secrets and variables` → `Actions`
   - Click **New repository secret**
   - **Name:** `NPM_TOKEN`
   - **Value:** Your npm access token from step 2
   - Click **Add secret**

#### 3. Test the Setup

1. **Verify CI works:**
   ```bash
   # Make a small change and push
   git add .
   git commit -m "test: verify CI workflow"
   git push origin main
   ```
   Check the **Actions** tab in your GitHub repo to see if tests pass.

2. **Test local publishing:**
   ```bash
   npm test
   npm run validate
   npm run typecheck
   ```

#### 4. Create Your First Release

1. **Go to your GitHub repository**
2. **Click "Releases"** → **"Create a new release"**
3. **Choose a tag:** `v0.1.0` (or your desired version)
4. **Release title:** `v0.1.0 - Initial Release`
5. **Description:** Add release notes
6. **Click "Publish release"**

🎉 **The workflow will automatically:**
- Run all tests
- Build the project
- Update `package.json` to version `0.1.0`
- Publish `your-unique-stacks-mcp-server@0.1.0` to npm
- Add a comment with installation instructions

#### 5. Verify Publication

After the workflow completes:

1. **Check the Actions tab** for workflow status
2. **Visit npm:** https://www.npmjs.com/package/your-unique-stacks-mcp-server
3. **Test installation:**
   ```bash
   npx your-unique-stacks-mcp-server
   ```

### Release Process

For subsequent releases:

1. **Make your changes** and push to main
2. **Create a new release** with an incremented version (e.g., `v0.1.1`, `v0.2.0`)
3. **The workflow handles everything else automatically**

### Manual Publishing (Alternative)

If you prefer manual publishing:

```bash
# Test everything
npm test
npm run validate
npm run typecheck

# Publish manually
npm login
npm publish --access public

# For updates
npm version patch  # or minor/major
npm publish
```

## License

MIT License
