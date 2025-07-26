import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { apiCall } from '../../lib/api.js';
import { NETWORKS } from '../../config/networks.js';
import { NetworkType } from '../../lib/types.js';

/**
 * Register resource handlers with the MCP server
 */
export function registerResourceHandlers(server: Server) {
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
} 