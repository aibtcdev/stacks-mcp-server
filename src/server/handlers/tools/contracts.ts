import { NetworkType } from '../../../lib/types.js';
import { getNetworkConfig } from '../../../config/networks.js';
import { parseEnvironment } from '../../../config/env.js';

const ENV = parseEnvironment();

export const contractTools = [
  {
    name: "call_read_only_function",
    description: "Call a read-only function on a Stacks smart contract without creating a transaction",
    inputSchema: {
      type: "object",
      properties: {
        contractAddress: {
          type: "string",
          description: "The Stacks address of the contract (e.g., 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7')"
        },
        contractName: {
          type: "string", 
          description: "The name of the contract"
        },
        functionName: {
          type: "string",
          description: "The name of the read-only function to call"
        },
        functionArgs: {
          type: "array",
          description: "Array of function arguments as Clarity values. Examples: ['u123'] for uint, ['\"hello\"'] for string, ['0x1234'] for buffer",
          items: {
            type: "string"
          },
          default: []
        },
        sender: {
          type: "string",
          description: "Optional sender address for the function call context",
          default: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
        },
        network: {
          type: "string",
          enum: ["mainnet", "testnet", "mocknet"],
          description: "Network to query",
          default: "testnet"
        }
      },
      required: ["contractAddress", "contractName", "functionName"]
    }
  }
];

export async function handleContractTool(toolName: string, args: any) {
  switch (toolName) {
    case "call_read_only_function": {
      const contractAddress = String(args?.contractAddress);
      const contractName = String(args?.contractName);
      const functionName = String(args?.functionName);
      const functionArgs = (args?.functionArgs as string[]) || [];
      const sender = String(args?.sender) || "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7";
      const network = (args?.network as NetworkType) || ENV.STACKS_NETWORK;

      if (!contractAddress) {
        throw new Error("Contract address is required");
      }
      if (!contractName) {
        throw new Error("Contract name is required");
      }
      if (!functionName) {
        throw new Error("Function name is required");
      }

      // Construct the full contract identifier
      const contractId = `${contractAddress}.${contractName}`;

      // Prepare the request body for the read-only function call
      const requestBody = {
        sender,
        arguments: functionArgs
      };

      // Make the API call to the read-only function endpoint
      const networkConfig = getNetworkConfig(network);
      const url = `${networkConfig.coreApiUrl}/v2/contracts/call-read/${contractId}/${functionName}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Stacks-MCP-Server/0.1.0',
      };

      if (ENV.HIRO_API_KEY) {
        headers['X-API-Key'] = ENV.HIRO_API_KEY;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage += ` - ${errorData.error}`;
          }
        } catch {
          // If we can't parse the error response, use the status text
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            network,
            contractId,
            functionName,
            functionArgs,
            result,
            success: true
          }, null, 2)
        }]
      };
    }

    default:
      throw new Error(`Unknown contract tool: ${toolName}`);
  }
} 