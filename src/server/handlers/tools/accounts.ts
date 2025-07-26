import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { NetworkType } from '../../../lib/types.js';
import { generatePrivateKey } from '../../../lib/crypto.js';
import { apiCall } from '../../../lib/api.js';
import { parseEnvironment } from '../../../config/env.js';

const ENV = parseEnvironment();

export const accountTools = [
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
          default: ENV.STACKS_NETWORK
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
          default: ENV.STACKS_NETWORK
        }
      },
      required: ["address"]
    }
  }
];

export async function handleAccountTool(toolName: string, args: any) {
  switch (toolName) {
    case "generate_account": {
      const network = (args?.network as NetworkType) || ENV.STACKS_NETWORK;
      
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
      const address = String(args?.address);
      const network = (args?.network as NetworkType) || ENV.STACKS_NETWORK;
      
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

    default:
      throw new Error(`Unknown account tool: ${toolName}`);
  }
} 