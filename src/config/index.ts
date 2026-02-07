interface Config {
  supabase: {
    url: string;
    anonKey: string;
  };
  geminiApiKey: string | null;
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

function getOptionalEnvVar(name: string): string | null {
  return process.env[name] || null;
}

function createConfig(): Config {
  return {
    supabase: {
      url: getEnvVar('EXPO_PUBLIC_SUPABASE_URL'),
      anonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
    },
    geminiApiKey: getOptionalEnvVar('EXPO_PUBLIC_GEMINI_API_KEY'),
    isDevelopment: __DEV__ ?? false,
  };
}

export const config = createConfig();
