import db from "@/lib/db";
import { expo } from "@/config/book";
import Reviews from "@/components/ui/reviews";
import Home from "./home";

const Page = async () => {
    const books = (await db.books.byIds([...expo])).map((b) => ({
        id: b.id,
        title: b.title,
        cover: b.cover,
        artStyle: b.artStyle,
    }));

    return (
        <main>
            <Home books={books} />
            <Reviews />
        </main>
    );
};

export default Page;
