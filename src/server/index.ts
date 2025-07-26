import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import handler registration functions
import { registerResourceHandlers } from './handlers/resources.js';
import { registerPromptHandlers } from './handlers/prompts.js';
import { registerToolHandlers } from './handlers/tools/index.js';

/**
 * Create and configure the MCP server with all handlers
 */
export function createServer(): Server {
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

  // Register all handlers
  registerResourceHandlers(server);
  registerPromptHandlers(server);
  registerToolHandlers(server);

  return server;
}

/**
 * Start the server using stdio transport
 */
export async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  
  await server.connect(transport);
  console.error("Stacks MCP Server started successfully");
} 