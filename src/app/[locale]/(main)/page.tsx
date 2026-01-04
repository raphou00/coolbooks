import db from "@/lib/db";
import Main from "@/components/layout/main";
import Home from "./home";

const Page = async () => {
    const books = await db.book.findMany({
        where: {
            id: {
                in: [
                    "4a323aaf-4147-450e-ba37-241fbbf41363",
                    "83a7dc9e-f3ca-44d4-8d8b-65ed61b27d0d",
                    "60fcc0bf-8d83-47f2-916b-3de8eaba8738",
                    "879ae571-6882-4e78-b32e-abb9964fcf3f",
                    "3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2",
                    "f7d0cbd5-0155-4858-8313-94c3bc06245c",
                    "fb03f998-cde2-4995-b143-af90c9d85891",
                    "339ac7a8-1340-41f1-a6f9-5642c8e079b9",
                ],
            },
        },
        select: {
            id: true,
            title: true,
            cover: true,
        },
    });

    return (
        <Main>
            <Home books={books} />
        </Main>
    );
};

export default Page;
