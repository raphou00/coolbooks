import Main from "@/components/layout/main";
import db from "@/lib/db";
import { Home, MyBooks } from "./home";
import { getUser } from "@/lib/auth";

const Page = async () => {
    const user = await getUser();

    const booksTrending = await db.book.findMany({
        select: {
            id: true,
            title: true,
            cover: true,
            user: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
    });

    const books = await db.book.findMany({
        where: {
            userId: user?.user?.id,
        },
        select: {
            id: true,
            title: true,
            cover: true,
            user: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    return (
        <Main className="flex m-0 pt-0">
            <Home books={booksTrending} />
            <MyBooks books={books} />
        </Main>
    );
};

export default Page;
