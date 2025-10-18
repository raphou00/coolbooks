import Main from "@/components/layout/main";
import Books from "@/components/ui/books";
import { getUser } from "@/lib/auth";
import db from "@/lib/db";

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
        take: 5,
        orderBy: {
            updatedAt: "desc",
        },
    });

    return (
        <Main className="mt-8 flex" gradientVariant="floatingGradient">
            <Books books={books} />
        </Main>
    );
};

export default Page;
