import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { db } from "@/core/db";
import * as schema from "@/core/db/schema";
import { sendPasswordResetEmailAction } from "@/features/auth/actions/send-password-reset-email";
import { normalizeName } from "@/shared/lib/utils";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not defined");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false,

    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmailAction({
        to: user.email,
        resetLink: url,
        userName: user.name,
      });
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const name = normalizeName(ctx.body.name);

        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              name,
            },
          },
        };
      }
    }),
  },

  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: true,
      },
      cpf: {
        type: "string",
        required: true,
      },
      cnpj: {
        type: "string",
        required: true,
      },
      street: {
        type: "string",
        required: false,
      },
      number: {
        type: "string",
        required: false,
      },
      complement: {
        type: "string",
        required: false,
      },
      neighborhood: {
        type: "string",
        required: false,
      },
      city: {
        type: "string",
        required: false,
      },
      uf: {
        type: "string",
        required: false,
      },
      cep: {
        type: "string",
        required: false,
      },
      referralCode: {
        type: "string",
        required: true,
      },
      referredBy: {
        type: "string",
        required: false,
      },
      abacatePayCustomerId: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
      },
    },
  },

  advanced: {
    database: {
      generateId: false,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  plugins: [nextCookies(), admin()],

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

// Error codes do Better Auth
export type ErrorCode =
  | "USER_ALREADY_EXISTS"
  | "EMAIL_NOT_VERIFIED"
  | "INVALID_CREDENTIALS"
  | "INVALID_EMAIL"
  | "INVALID_PASSWORD"
  | "USER_NOT_FOUND"
  | "SESSION_NOT_FOUND"
  | "VERIFICATION_TOKEN_EXPIRED"
  | "VERIFICATION_TOKEN_NOT_FOUND"
  | "UNKNOWN";
