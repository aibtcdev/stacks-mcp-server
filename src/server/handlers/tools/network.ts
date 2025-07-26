import { NetworkType } from '../../../lib/types.js';
import { apiCall } from '../../../lib/api.js';
import { parseEnvironment } from '../../../config/env.js';

const ENV = parseEnvironment();

export const networkTools = [
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
          default: ENV.STACKS_NETWORK
        }
      }
    }
  }
];

export async function handleNetworkTool(toolName: string, args: any) {
  switch (toolName) {
    case "get_block_info": {
      const blockId = String(args?.blockId);
      const network = (args?.network as NetworkType) || ENV.STACKS_NETWORK;
      
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
      const network = (args?.network as NetworkType) || ENV.STACKS_NETWORK;
      
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

    default:
      throw new Error(`Unknown network tool: ${toolName}`);
  }
} 