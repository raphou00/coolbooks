import db from "@/lib/db";
import { expo } from "@/config/book";
import Main from "@/components/layout/main";
import Home from "./home";

const Page = async () => {
    const books = await db.book.findMany({
        where: {
            id: {
                in: expo,
            },
        },
        select: {
            id: true,
            title: true,
            cover: true,
            artStyle: true,
        },
    });

    return (
        <Main>
            <Home books={books} />
        </Main>
    );
};

export default Page;
