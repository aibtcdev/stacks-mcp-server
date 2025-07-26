import { NetworkType } from '../../../lib/types.js';
import { apiCall } from '../../../lib/api.js';
import { parseEnvironment } from '../../../config/env.js';

const ENV = parseEnvironment();

export const transactionTools = [
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
          default: ENV.STACKS_NETWORK
        }
      },
      required: ["txId"]
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
          default: ENV.STACKS_NETWORK
        }
      },
      required: ["address"]
    }
  }
];

export async function handleTransactionTool(toolName: string, args: any) {
  switch (toolName) {
    case "get_transaction_info": {
      const txId = String(args?.txId);
      const network = (args?.network as NetworkType) || ENV.STACKS_NETWORK;
      
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

    case "search_transactions": {
      const address = String(args?.address);
      const limit = Number(args?.limit) || 10;
      const network = (args?.network as NetworkType) || ENV.STACKS_NETWORK;
      
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

    default:
      throw new Error(`Unknown transaction tool: ${toolName}`);
  }
} 