import { EnvConfig, NetworkType } from '../lib/types.js';

/**
 * Parse and validate environment variables
 */
export function parseEnvironment(): EnvConfig {
  // Validate and parse STACKS_NETWORK
  const stacksNetwork = process.env.STACKS_NETWORK?.toLowerCase();
  let defaultNetwork: NetworkType = 'testnet'; // Default fallback
  
  if (stacksNetwork && ['mainnet', 'testnet', 'mocknet'].includes(stacksNetwork)) {
    defaultNetwork = stacksNetwork as NetworkType;
  } else if (stacksNetwork) {
    console.error(`⚠️  Invalid STACKS_NETWORK value: ${stacksNetwork}. Using 'testnet' as default.`);
    console.error('   Valid values: mainnet, testnet, mocknet');
  }

  const env: EnvConfig = {
    HIRO_API_KEY: process.env.HIRO_API_KEY,
    HIRO_MAINNET_API_URL: process.env.HIRO_MAINNET_API_URL || 'https://api.mainnet.hiro.so',
    HIRO_TESTNET_API_URL: process.env.HIRO_TESTNET_API_URL || 'https://api.testnet.hiro.so',
    HIRO_MOCKNET_API_URL: process.env.HIRO_MOCKNET_API_URL || 'http://localhost:3999',
    DEBUG: process.env.DEBUG,
    MCP_SERVER_TIMEOUT: process.env.MCP_SERVER_TIMEOUT || '30000',
    STACKS_NETWORK: defaultNetwork,
  };

  // Log configuration (without exposing sensitive data)
  if (env.DEBUG === '1' || env.DEBUG === 'true') {
    console.error('🔧 Environment Configuration:');
    console.error(`   HIRO_API_KEY: ${env.HIRO_API_KEY ? '✅ Configured' : '❌ Not set (using free tier)'}`);
    console.error(`   DEFAULT_NETWORK: ${env.STACKS_NETWORK} ${stacksNetwork && stacksNetwork !== env.STACKS_NETWORK ? '(corrected from invalid value)' : ''}`);
    console.error(`   MAINNET_URL: ${env.HIRO_MAINNET_API_URL}`);
    console.error(`   TESTNET_URL: ${env.HIRO_TESTNET_API_URL}`);
    console.error(`   MOCKNET_URL: ${env.HIRO_MOCKNET_API_URL}`);
    console.error(`   TIMEOUT: ${env.MCP_SERVER_TIMEOUT}ms`);
  }

  return env;
} 