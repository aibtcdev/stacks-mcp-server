import { NetworkType, NetworkConfig, NetworksConfig } from '../lib/types.js';
import { parseEnvironment } from './env.js';

// Parse environment variables at startup
const ENV = parseEnvironment();

/**
 * Network configurations with API key support
 */
export const NETWORKS: NetworksConfig = {
  mainnet: {
    coreApiUrl: ENV.HIRO_MAINNET_API_URL!,
    name: 'Stacks Mainnet'
  },
  testnet: {
    coreApiUrl: ENV.HIRO_TESTNET_API_URL!,
    name: 'Stacks Testnet'
  },
  mocknet: {
    coreApiUrl: ENV.HIRO_MOCKNET_API_URL!,
    name: 'Stacks Mocknet'
  }
};

/**
 * Get network configuration
 */
export function getNetworkConfig(networkType: NetworkType): NetworkConfig {
  return NETWORKS[networkType] || NETWORKS.testnet;
} 