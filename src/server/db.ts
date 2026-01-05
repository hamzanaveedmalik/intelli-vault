import { env } from "~/env";
import { PrismaClient } from "../../generated/prisma";

const createPrismaClient = () => {
  // DATABASE_URL is validated at runtime, not build time
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  
  return new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
