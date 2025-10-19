import Main from "@/components/layout/main";
import { getUser } from "@/lib/auth";
import db from "@/lib/db";
import { Home } from "./home";

const Page = async () => {
    const user = await getUser();
    const books = await db.book.findMany({
        where: {
            user: {
                id: user?.user?.id,
            },
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
        <Main className="mt-8 flex">
            <Home books={books} />
        </Main>
    );
};

export default Page;
