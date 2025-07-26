import { NetworkType } from './types.js';
import { getNetworkConfig } from '../config/networks.js';
import { parseEnvironment } from '../config/env.js';

// Parse environment variables at module load
const ENV = parseEnvironment();

/**
 * Enhanced API client with authentication and error handling
 */
export async function apiCall(networkType: NetworkType, endpoint: string) {
  const network = getNetworkConfig(networkType);
  const url = `${network.coreApiUrl}${endpoint}`;
  
  // Prepare headers with optional API key authentication
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Stacks-MCP-Server/0.1.0',
  };

  // Add Hiro API key for enhanced rate limits if available
  if (ENV.HIRO_API_KEY) {
    headers['X-API-Key'] = ENV.HIRO_API_KEY;
  }

  const timeoutMs = parseInt(ENV.MCP_SERVER_TIMEOUT || '30000');
  
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    if (ENV.DEBUG === '1' || ENV.DEBUG === 'true') {
      console.error(`🌐 API Call: ${url}`);
      console.error(`🔑 Using API Key: ${ENV.HIRO_API_KEY ? 'Yes' : 'No (free tier)'}`);
    }

    const response = await fetch(url, {
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Enhanced error handling for API responses
      let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage += ` - ${errorData.error}`;
        }
        if (errorData.message) {
          errorMessage += ` - ${errorData.message}`;
        }
      } catch {
        // If we can't parse the error response, use the status text
      }

      // Specific handling for rate limit errors
      if (response.status === 429) {
        errorMessage += '. Consider using a Hiro API key for higher rate limits: https://www.hiro.so/';
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Log rate limit headers if in debug mode
    if (ENV.DEBUG === '1' || ENV.DEBUG === 'true') {
      const rateLimit = response.headers.get('X-RateLimit-Limit');
      const rateRemaining = response.headers.get('X-RateLimit-Remaining');
      const rateReset = response.headers.get('X-RateLimit-Reset');
      
      if (rateLimit) {
        console.error(`📊 Rate Limit: ${rateRemaining}/${rateLimit} remaining (resets: ${rateReset})`);
      }
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`API call timeout after ${timeoutMs}ms: ${url}`);
      }
      throw error;
    }
    throw new Error(`Unknown error during API call to ${url}`);
  }
} 