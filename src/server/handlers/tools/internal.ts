import { NetworkType } from '../../../lib/types.js';
import { NETWORKS } from '../../../config/networks.js';
import { parseEnvironment } from '../../../config/env.js';

const ENV = parseEnvironment();

export const internalTools = [
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
];

export async function handleInternalTool(toolName: string, args: any) {
  switch (toolName) {
    case "check_api_status": {
      const includeLimits = args?.include_limits !== false;
      
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
      throw new Error(`Unknown internal tool: ${toolName}`);
  }
} 