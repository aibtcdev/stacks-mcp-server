#!/usr/bin/env node

/**
 * Stacks MCP Server
 * 
 * This MCP server provides basic Stacks.js blockchain functionality including:
 * - Account management (generate accounts, check balances)
 * - Transaction operations (STX transfers, contract calls)
 * - Network information and block queries
 * - Smart contract interactions
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Stacks.js imports - simplified to avoid import issues
import {
  makeSTXTokenTransfer,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
} from "@stacks/transactions";

import crypto from 'crypto';

/**
 * Supported networks
 */
type NetworkType = 'mainnet' | 'testnet' | 'mocknet';

/**
 * Environment variable configuration with type safety
 */
interface EnvConfig {
  HIRO_API_KEY?: string;
  HIRO_MAINNET_API_URL?: string;
  HIRO_TESTNET_API_URL?: string;
  HIRO_MOCKNET_API_URL?: string;
  DEBUG?: string;
  MCP_SERVER_TIMEOUT?: string;
}

/**
 * Parse and validate environment variables
 */
function parseEnvironment(): EnvConfig {
  const env: EnvConfig = {
    HIRO_API_KEY: process.env.HIRO_API_KEY,
    HIRO_MAINNET_API_URL: process.env.HIRO_MAINNET_API_URL || 'https://api.mainnet.hiro.so',
    HIRO_TESTNET_API_URL: process.env.HIRO_TESTNET_API_URL || 'https://api.testnet.hiro.so',
    HIRO_MOCKNET_API_URL: process.env.HIRO_MOCKNET_API_URL || 'http://localhost:3999',
    DEBUG: process.env.DEBUG,
    MCP_SERVER_TIMEOUT: process.env.MCP_SERVER_TIMEOUT || '30000',
  };

  // Log configuration (without exposing sensitive data)
  if (env.DEBUG === '1' || env.DEBUG === 'true') {
    console.error('🔧 Environment Configuration:');
    console.error(`   HIRO_API_KEY: ${env.HIRO_API_KEY ? '✅ Configured' : '❌ Not set (using free tier)'}`);
    console.error(`   MAINNET_URL: ${env.HIRO_MAINNET_API_URL}`);
    console.error(`   TESTNET_URL: ${env.HIRO_TESTNET_API_URL}`);
    console.error(`   MOCKNET_URL: ${env.HIRO_MOCKNET_API_URL}`);
    console.error(`   TIMEOUT: ${env.MCP_SERVER_TIMEOUT}ms`);
  }

  return env;
}

// Parse environment variables at startup
const ENV = parseEnvironment();

/**
 * Network configurations with API key support
 */
const NETWORKS = {
  mainnet: {
    coreApiUrl: ENV.HIRO_MAINNET_API_URL!,
    name: 'Stacks Mainnet'
  },
  testnet: {
    coreApiUrl: ENV.HIRO_TESTNET_API_URL!,
    name: 'Stacks Testnet'
  },
  mocknet: {
    coreApiUrl: ENV.HIRO_MOCKNET_API_URL!,
    name: 'Stacks Mocknet'
  }
};

/**
 * Get network configuration
 */
function getNetworkConfig(networkType: NetworkType) {
  return NETWORKS[networkType] || NETWORKS.testnet;
}

/**
 * Enhanced API client with authentication and error handling
 */
async function apiCall(networkType: NetworkType, endpoint: string) {
  const network = getNetworkConfig(networkType);
  const url = `${network.coreApiUrl}${endpoint}`;
  
  // Prepare headers with optional API key authentication
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Stacks-MCP-Server/0.1.0',
  };

  // Add Hiro API key for enhanced rate limits if available
  if (ENV.HIRO_API_KEY) {
    headers['X-API-Key'] = ENV.HIRO_API_KEY;
  }

  const timeoutMs = parseInt(ENV.MCP_SERVER_TIMEOUT || '30000');
  
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    if (ENV.DEBUG === '1' || ENV.DEBUG === 'true') {
      console.error(`🌐 API Call: ${url}`);
      console.error(`🔑 Using API Key: ${ENV.HIRO_API_KEY ? 'Yes' : 'No (free tier)'}`);
    }

    const response = await fetch(url, {
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Enhanced error handling for API responses
      let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage += ` - ${errorData.error}`;
        }
        if (errorData.message) {
          errorMessage += ` - ${errorData.message}`;
        }
      } catch {
        // If we can't parse the error response, use the status text
      }

      // Specific handling for rate limit errors
      if (response.status === 429) {
        errorMessage += '. Consider using a Hiro API key for higher rate limits: https://www.hiro.so/';
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Log rate limit headers if in debug mode
    if (ENV.DEBUG === '1' || ENV.DEBUG === 'true') {
      const rateLimit = response.headers.get('X-RateLimit-Limit');
      const rateRemaining = response.headers.get('X-RateLimit-Remaining');
      const rateReset = response.headers.get('X-RateLimit-Reset');
      
      if (rateLimit) {
        console.error(`📊 Rate Limit: ${rateRemaining}/${rateLimit} remaining (resets: ${rateReset})`);
      }
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`API call timeout after ${timeoutMs}ms: ${url}`);
      }
      throw error;
    }
    throw new Error(`Unknown error during API call to ${url}`);
  }
}

/**
 * Generate a simple private key (hex format)
 */
function generatePrivateKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create an MCP server with Stacks.js blockchain capabilities
 */
const server = new Server(
  {
    name: "Stacks MCP Server",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

/**
 * Handler for listing available Stacks resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "stacks://networks",
        mimeType: "application/json",
        name: "Stacks Networks",
        description: "Available Stacks network configurations"
      },
      {
        uri: "stacks://network-info/testnet",
        mimeType: "application/json", 
        name: "Testnet Info",
        description: "Current Stacks testnet information"
      },
      {
        uri: "stacks://network-info/mainnet",
        mimeType: "application/json",
        name: "Mainnet Info", 
        description: "Current Stacks mainnet information"
      }
    ]
  };
});

/**
 * Handler for reading Stacks resources
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);
  const path = url.pathname.replace(/^\//, '');

  try {
    if (path === "networks") {
      return {
        contents: [{
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify({
            networks: [
              { name: "mainnet", description: "Stacks Mainnet", url: NETWORKS.mainnet.coreApiUrl },
              { name: "testnet", description: "Stacks Testnet", url: NETWORKS.testnet.coreApiUrl },
              { name: "mocknet", description: "Stacks Mocknet (Local Development)", url: NETWORKS.mocknet.coreApiUrl }
            ]
          }, null, 2)
        }]
      };
    }

    if (path.startsWith("network-info/")) {
      const networkType = path.split("/")[1] as NetworkType;
      
      const [coreInfo, networkInfo] = await Promise.all([
        apiCall(networkType, '/v2/info'),
        apiCall(networkType, '/extended/v2/network')
      ]);

      return {
        contents: [{
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify({
            network: networkType,
            coreInfo,
            networkInfo
          }, null, 2)
        }]
      };
    }

    throw new Error(`Resource ${path} not found`);
  } catch (error) {
    throw new Error(`Failed to fetch resource: ${error}`);
  }
});

/**
 * Handler that lists available Stacks tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_account",
        description: "Generate a new Stacks account with private key and basic info",
        inputSchema: {
          type: "object",
          properties: {
            network: {
              type: "string",
              enum: ["mainnet", "testnet", "mocknet"],
              description: "Network type for address generation",
              default: "testnet"
            }
          }
        }
      },
      {
        name: "get_account_balance",
        description: "Get STX balance and account information for a Stacks address",
        inputSchema: {
          type: "object",
          properties: {
            address: {
              type: "string",
              description: "Stacks address to check balance for"
            },
            network: {
              type: "string", 
              enum: ["mainnet", "testnet", "mocknet"],
              description: "Network to query",
              default: "testnet"
            }
          },
          required: ["address"]
        }
      },
      {
        name: "get_transaction_info", 
        description: "Get information about a transaction by ID",
        inputSchema: {
          type: "object",
          properties: {
            txId: {
              type: "string",
              description: "Transaction ID to look up"
            },
            network: {
              type: "string",
              enum: ["mainnet", "testnet", "mocknet"], 
              description: "Network to query",
              default: "testnet"
            }
          },
          required: ["txId"]
        }
      },
      {
        name: "get_block_info",
        description: "Get information about a specific block",
        inputSchema: {
          type: "object",
          properties: {
            blockId: {
              type: "string",
              description: "Block hash or height to look up"
            },
            network: {
              type: "string",
              enum: ["mainnet", "testnet", "mocknet"],
              description: "Network to query", 
              default: "testnet"
            }
          },
          required: ["blockId"]
        }
      },
      {
        name: "get_network_status",
        description: "Get current network status and blockchain information",
        inputSchema: {
          type: "object",
          properties: {
            network: {
              type: "string",
              enum: ["mainnet", "testnet", "mocknet"],
              description: "Network to query",
              default: "testnet"
            }
          }
        }
      },
      {
        name: "search_transactions",
        description: "Search for transactions by address",
        inputSchema: {
          type: "object",
          properties: {
            address: {
              type: "string",
              description: "Address to search transactions for"
            },
            limit: {
              type: "number",
              description: "Maximum number of transactions to return",
              default: 10
            },
            network: {
              type: "string",
              enum: ["mainnet", "testnet", "mocknet"],
              description: "Network to query",
              default: "testnet"
            }
          },
          required: ["address"]
        }
      },
      {
        name: "check_api_status",
        description: "Check API key status and configuration",
        inputSchema: {
          type: "object",
          properties: {
            include_limits: {
              type: "boolean",
              description: "Include rate limit information if available",
              default: true
            }
          }
        }
      }
    ]
  };
});

/**
 * Handler for Stacks tools
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "generate_account": {
        const network = (request.params.arguments?.network as NetworkType) || "testnet";
        
        // Generate a simple private key
        const privateKey = generatePrivateKey();
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              network,
              privateKey,
              warning: "This is a simplified account generation. For production use, please use proper Stacks.js key generation functions.",
              note: "Keep your private key secure! Never share it with anyone.",
              nextSteps: [
                "Use proper Stacks.js libraries to derive public key and address from this private key",
                "Fund the account on testnet using the testnet faucet",
                "Use get_account_balance to check the balance"
              ]
            }, null, 2)
          }]
        };
      }

      case "get_account_balance": {
        const address = String(request.params.arguments?.address);
        const network = (request.params.arguments?.network as NetworkType) || "testnet";
        
        if (!address) {
          throw new Error("Address is required");
        }

        const balanceInfo = await apiCall(network, `/extended/v1/address/${address}/balances`);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              address,
              network,
              balance: balanceInfo
            }, null, 2)
          }]
        };
      }

      case "get_transaction_info": {
        const txId = String(request.params.arguments?.txId);
        const network = (request.params.arguments?.network as NetworkType) || "testnet";
        
        if (!txId) {
          throw new Error("Transaction ID is required");
        }

        const txInfo = await apiCall(network, `/extended/v1/tx/${txId}`);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              network,
              transaction: txInfo
            }, null, 2)
          }]
        };
      }

      case "get_block_info": {
        const blockId = String(request.params.arguments?.blockId);
        const network = (request.params.arguments?.network as NetworkType) || "testnet";
        
        if (!blockId) {
          throw new Error("Block ID is required");
        }

        let endpoint;
        if (/^\d+$/.test(blockId)) {
          // It's a block height
          endpoint = `/extended/v2/blocks/by-height/${blockId}`;
        } else {
          // It's a block hash
          endpoint = `/extended/v2/blocks/${blockId}`;
        }
        
        const blockInfo = await apiCall(network, endpoint);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              network,
              block: blockInfo
            }, null, 2)
          }]
        };
      }

      case "get_network_status": {
        const network = (request.params.arguments?.network as NetworkType) || "testnet";
        
        const [coreInfo, networkInfo, poxInfo] = await Promise.all([
          apiCall(network, '/v2/info'),
          apiCall(network, '/extended/v2/network'),
          apiCall(network, '/v2/pox').catch(() => null) // POX might not be available on all networks
        ]);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              network,
              status: {
                coreInfo,
                networkInfo,
                poxInfo: poxInfo || "Not available"
              }
            }, null, 2)
          }]
        };
      }

      case "search_transactions": {
        const address = String(request.params.arguments?.address);
        const limit = Number(request.params.arguments?.limit) || 10;
        const network = (request.params.arguments?.network as NetworkType) || "testnet";
        
        if (!address) {
          throw new Error("Address is required");
        }

        const transactions = await apiCall(network, `/extended/v1/address/${address}/transactions?limit=${limit}`);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              network,
              address,
              transactions
            }, null, 2)
          }]
        };
      }

      case "check_api_status": {
        const includeLimits = request.params.arguments?.include_limits !== false;
        
        const status = {
          apiKey: {
            configured: !!ENV.HIRO_API_KEY,
            status: ENV.HIRO_API_KEY ? "✅ Active (enhanced rate limits)" : "❌ Not configured (free tier)",
            setupUrl: "https://www.hiro.so/"
          },
          configuration: {
            mainnetUrl: ENV.HIRO_MAINNET_API_URL,
            testnetUrl: ENV.HIRO_TESTNET_API_URL,
            mocknetUrl: ENV.HIRO_MOCKNET_API_URL,
            timeout: `${ENV.MCP_SERVER_TIMEOUT}ms`,
            debug: ENV.DEBUG === '1' || ENV.DEBUG === 'true'
          },
          networks: Object.keys(NETWORKS)
        };

        // Test API connectivity and get rate limit info if requested
        if (includeLimits) {
          try {
            // Make a simple API call to get current rate limit status
            const testNetwork: NetworkType = 'testnet';
            const url = `${NETWORKS[testNetwork].coreApiUrl}/v2/info`;
            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
              'User-Agent': 'Stacks-MCP-Server/0.1.0',
            };

            if (ENV.HIRO_API_KEY) {
              headers['X-API-Key'] = ENV.HIRO_API_KEY;
            }

            const response = await fetch(url, { headers });
            
            (status as any).rateLimits = {
              testResult: response.ok ? "✅ API accessible" : `❌ Error: ${response.status}`,
              limit: response.headers.get('X-RateLimit-Limit') || 'Unknown',
              remaining: response.headers.get('X-RateLimit-Remaining') || 'Unknown',
              reset: response.headers.get('X-RateLimit-Reset') || 'Unknown'
            };
          } catch (error) {
            (status as any).rateLimits = {
              testResult: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              note: "Check your internet connection and API endpoints"
            };
          }
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify(status, null, 2)
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
});

/**
 * Handler that lists available prompts
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "stacks_overview",
        description: "Get an overview of Stacks blockchain capabilities available through this MCP server"
      },
      {
        name: "getting_started_guide", 
        description: "Get a guide on how to start using Stacks blockchain features"
      }
    ]
  };
});

/**
 * Handler for prompts
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  switch (request.params.name) {
    case "stacks_overview":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `This Stacks MCP Server provides the following blockchain capabilities:

## Account Management
- Generate new Stacks accounts with private keys
- Check STX balances and account information
- Support for mainnet, testnet, and mocknet

## Network Information
- Get network status and blockchain info
- Query block information by height or hash
- Access network-specific configurations

## Transaction Queries
- Query transaction status and details by transaction ID
- Search transactions by address
- Get transaction history

## Getting Started
1. Use 'generate_account' to create a new account
2. Use 'get_account_balance' to check balances
3. Use 'get_network_status' to check network health
4. Use 'search_transactions' to find transaction history

All operations support multiple networks (mainnet/testnet/mocknet) and provide detailed JSON responses.

Note: This is a read-only implementation focused on querying blockchain data. For transaction creation and broadcasting, additional Stacks.js integration would be needed.`
            }
          }
        ]
      };

    case "getting_started_guide":
      return {
        messages: [
          {
            role: "user", 
            content: {
              type: "text",
              text: `## Getting Started with Stacks MCP Server

### 1. Check Network Status
Start by checking if the network is healthy:
\`\`\`
get_network_status(network: "testnet")
\`\`\`

### 2. Generate an Account
Create a new account for testing:
\`\`\`
generate_account(network: "testnet")
\`\`\`

### 3. Fund Your Account
- For testnet: Use the Stacks testnet faucet
- Visit: https://explorer.hiro.so/sandbox/faucet
- Enter your testnet address to receive test STX

### 4. Check Your Balance
\`\`\`
get_account_balance(address: "your_address", network: "testnet")
\`\`\`

### 5. Explore Blockchain Data
- View blocks: \`get_block_info(blockId: "123", network: "testnet")\`
- Search transactions: \`search_transactions(address: "your_address", network: "testnet")\`

### Important Notes
- Always use testnet for development and testing
- Keep private keys secure and never share them
- This server provides read-only blockchain access
- For sending transactions, use full Stacks.js libraries`
            }
          }
        ]
      };

    default:
      throw new Error(`Unknown prompt: ${request.params.name}`);
  }
});

/**
 * Start the server using stdio transport
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Stacks MCP Server started successfully");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
