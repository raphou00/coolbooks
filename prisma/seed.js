import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function seed() {
    await prisma.user.create({
        data: {
            name: "admin",
            email: "admin@pinksea.me",
            password: await hash("29100710", 10),
            emailVerified: true,
            role: "ADMIN",
        },
    });
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
