// features/square/squareClient.ts

import { SquareClient } from "square";
import { env } from "@/lib/env";

export const squareClient = new SquareClient({
  token: env.square.accessToken,
});
