import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      workspaceId: string | null;
      role: "OWNER_CCO" | "MEMBER" | null;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    DiscordProvider,
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production", // HTTPS-only in production
      },
    },
  },
  callbacks: {
    session: async ({ session, user }) => {
      // Fetch user's primary workspace and role
      // Priority: 1) First OWNER_CCO workspace, 2) First workspace alphabetically
      const userWorkspace = await db.userWorkspace.findFirst({
        where: {
          userId: user.id,
        },
        orderBy: [
          { role: "asc" }, // OWNER_CCO comes before MEMBER alphabetically
          { workspace: { name: "asc" } }, // Then by workspace name
        ],
        include: {
          workspace: true,
        },
      });

      // If user has no workspace, return session without workspaceId/role
      // This allows them to create a workspace
      if (!userWorkspace) {
        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
            workspaceId: "",
            role: "MEMBER" as const, // Default role, will be updated when workspace is created
          },
        };
      }

      return {
      ...session,
      user: {
        ...session.user,
        id: user.id,
          workspaceId: userWorkspace.workspaceId,
          role: userWorkspace.role,
        },
      };
      },
  },
} satisfies NextAuthConfig;
