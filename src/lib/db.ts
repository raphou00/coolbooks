import { PrismaClient } from "@prisma/client";
import env from "./env";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query", "info", "warn", "error"],
    });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default globalForPrisma.prisma;
