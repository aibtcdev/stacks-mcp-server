/**
 * Core TypeScript types for the Stacks MCP Server
 */

/**
 * Supported networks
 */
export type NetworkType = 'mainnet' | 'testnet' | 'mocknet';

/**
 * Environment variable configuration with type safety
 */
export interface EnvConfig {
  HIRO_API_KEY?: string;
  HIRO_MAINNET_API_URL?: string;
  HIRO_TESTNET_API_URL?: string;
  HIRO_MOCKNET_API_URL?: string;
  DEBUG?: string;
  MCP_SERVER_TIMEOUT?: string;
  STACKS_NETWORK?: NetworkType;
}

/**
 * Network configuration structure
 */
export interface NetworkConfig {
  coreApiUrl: string;
  name: string;
}

/**
 * Networks configuration mapping
 */
export interface NetworksConfig {
  mainnet: NetworkConfig;
  testnet: NetworkConfig;
  mocknet: NetworkConfig;
} 