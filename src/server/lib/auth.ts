import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  getAllowedOrigins,
  getBetterAuthSecret,
  getBetterAuthUrl,
} from "./env";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: getBetterAuthUrl(),
  basePath: "/api/auth",
  secret: getBetterAuthSecret(),
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  trustedOrigins: getAllowedOrigins(),
  rateLimit: {
    enabled: process.env.DISABLE_AUTH_RATE_LIMIT !== "true",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 10, max: 5 },
      "/sign-up/email": { window: 10, max: 5 },
    },
    storage: "memory",
  },
});

export type AuthSession = typeof auth.$Infer.Session;
