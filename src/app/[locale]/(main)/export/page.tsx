import Main from "@/components/layout/main";
import db from "@/lib/db";
import Export from "./export";

const Page = async () => {
    const book = await db.book.findFirst({
        select: {
            id: true,
            title: true,
            cover: true,
            themes: true,
            artStyle: true,
            public: true,
            pages: {
                select: {
                    number: true,
                    image: true,
                    color: true,
                    text: true,
                },
            },
            user: {
                select: {
                    name: true,
                },
            },
            updatedAt: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <Main className="flex">
            <Export book={book!} />
        </Main>
    );
};

export default Page;
