import type { RestaurantRole } from "../generated/prisma/client";
import type { AuthSession } from "./lib/auth";

export type AppEnv = {
  Variables: {
    user: AuthSession["user"] | null;
    session: AuthSession["session"] | null;
    userId: string | null;
    restaurantId: string | null;
    restaurantRole: RestaurantRole | null;
  };
};
