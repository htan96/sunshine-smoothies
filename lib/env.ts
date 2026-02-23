// src/lib/env.ts

const requiredEnv = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  square: {
    accessToken: requiredEnv(
      process.env.SQUARE_ACCESS_TOKEN,
      "SQUARE_ACCESS_TOKEN"
    ),

    // 🔥 REMOVE REQUIRED LOCATION
    // We are now passing location dynamically in checkout

    environment: "production" as const,
  },
}