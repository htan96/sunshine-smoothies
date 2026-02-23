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
    locationId: requiredEnv(
      process.env.SQUARE_LOCATION_ID,
      "SQUARE_LOCATION_ID"
    ),
    environment: "production" as const,
  },
};
