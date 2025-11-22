const readEnvVar = (key: string, fallback?: string) => {
  const value = process.env[key];
  if (value && value.trim().length > 0) {
    return value;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error(`Missing environment variable: ${key}`);
};

export const env = {
  apiUrl: readEnvVar("NEXT_PUBLIC_API_URL", "http://localhost:8080"),
  accessTokenKey: readEnvVar(
    "NEXT_PUBLIC_ACCESS_TOKEN_KEY",
    "orchard_admin_token"
  ),
  // JWT secret for token verification (optional, but recommended for security)
  // If not provided, middleware will decode token without verification (less secure but faster)
  jwtSecret: process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET,
};

export const REFRESH_TOKEN_STORAGE_KEY = "orchard_refresh_token";
