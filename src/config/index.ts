/**
 * Application configuration module
 * Validates and exports environment variables
 */

interface Config {
  supabase: {
    url: string;
    anonKey: string;
  };
  isDevelopment: boolean;
}

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Make sure you have a .env file with ${name} defined.`
    );
  }
  return value;
}

function createConfig(): Config {
  return {
    supabase: {
      url: getEnvVar('EXPO_PUBLIC_SUPABASE_URL'),
      anonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
    },
    isDevelopment: __DEV__ ?? false,
  };
}

// Validate config on import - fail fast if env vars are missing
export const config = createConfig();
