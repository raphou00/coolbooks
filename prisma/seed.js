import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function seed() {
    await prisma.user.create({
        data: {
            name: "Cool Books",
            email: "rey29raphael@gmail.com",
            password: await hash("29100710", 10),
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
