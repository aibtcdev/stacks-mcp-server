import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Import all tool modules
import { accountTools, handleAccountTool } from './accounts.js';
import { networkTools, handleNetworkTool } from './network.js';
import { transactionTools, handleTransactionTool } from './transactions.js';
import { contractTools, handleContractTool } from './contracts.js';
import { internalTools, handleInternalTool } from './internal.js';

// Aggregate all tools
const allTools = [
  ...accountTools,
  ...transactionTools,
  ...networkTools,
  ...contractTools,
  ...internalTools
];

// Create a mapping of tool names to their handlers
const toolHandlers = new Map([
  // Account tools
  ['generate_account', handleAccountTool],
  ['get_account_balance', handleAccountTool],
  
  // Transaction tools
  ['get_transaction_info', handleTransactionTool],
  ['search_transactions', handleTransactionTool],
  
  // Network tools
  ['get_block_info', handleNetworkTool],
  ['get_network_status', handleNetworkTool],
  
  // Contract tools
  ['call_read_only_function', handleContractTool],
  
  // Internal tools
  ['check_api_status', handleInternalTool]
]);

/**
 * Register all tool handlers with the MCP server
 */
export function registerToolHandlers(server: Server) {
  /**
   * Handler that lists available Stacks tools
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools
    };
  });

  /**
   * Handler for Stacks tools
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const toolName = request.params.name;
      const handler = toolHandlers.get(toolName);
      
      if (!handler) {
        throw new Error(`Unknown tool: ${toolName}`);
      }

      return await handler(toolName, request.params.arguments);
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
} 