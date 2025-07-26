#!/usr/bin/env node

/**
 * Stacks MCP Server - CLI Entry Point
 * 
 * This is a thin CLI entry point that bootstraps the modular Stacks MCP Server.
 * The actual server implementation is organized into focused modules for better maintainability.
 */

import { main } from './server/index.js';

// Start the server
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
