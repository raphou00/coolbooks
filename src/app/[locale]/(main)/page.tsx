import Main from "@/components/layout/main";
import BookViewer from "@/components/ui/book";
import { getUser } from "@/lib/auth";
import db from "@/lib/db";

const Page = async () => {
    const user = await getUser();

    const book = await db.book.findFirst({
        where: {
            userId: user?.user?.id,
        },
        select: {
            title: true,
            promptText: true,
            promptImage: true,
            pages: {
                select: {
                    text: true,
                    color: true,
                    images: {
                        select: {
                            src: true,
                            width: true,
                            height: true,
                        },
                    },
                },
            },
        },
    });

    return (
        <Main className="mt-8 flex" gradientVariant="floatingGradient">
            Salut {user?.user?.name}
            <BookViewer book={book!} />
        </Main>
    );
};

export default Page;
