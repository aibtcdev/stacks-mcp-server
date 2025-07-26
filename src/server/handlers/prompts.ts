import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Register prompt handlers with the MCP server
 */
export function registerPromptHandlers(server: Server) {
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

## Smart Contract Interactions
- Call read-only functions on smart contracts without fees
- Query contract state and public data
- Support for function arguments and custom sender addresses

## Getting Started
1. Use 'generate_account' to create a new account
2. Use 'get_account_balance' to check balances
3. Use 'get_network_status' to check network health
4. Use 'call_read_only_function' to interact with smart contracts
5. Use 'search_transactions' to find transaction history

All operations support multiple networks (mainnet/testnet/mocknet) and provide detailed JSON responses.

Note: This implementation focuses on querying blockchain data and calling read-only contract functions. For transaction creation and broadcasting, additional Stacks.js integration would be needed.`
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

### 5. Call Smart Contract Functions
\`\`\`
call_read_only_function(
  contractAddress: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
  contractName: "my-contract",
  functionName: "get-balance",
  functionArgs: ["SP1234567890ABCDEF"],
  network: "testnet"
)
\`\`\`

### 6. Explore Blockchain Data
- View blocks: \`get_block_info(blockId: "123", network: "testnet")\`
- Search transactions: \`search_transactions(address: "your_address", network: "testnet")\`

### Important Notes
- Always use testnet for development and testing
- Keep private keys secure and never share them
- Read-only functions can be called without fees or transactions
- Use proper Clarity value formatting for function arguments
- For sending transactions, use full Stacks.js libraries`
              }
            }
          ]
        };

      default:
        throw new Error(`Unknown prompt: ${request.params.name}`);
    }
  });
} 