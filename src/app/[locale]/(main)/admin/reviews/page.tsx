import { redirect } from "next/navigation";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import Main from "@/components/layout/main";
import Moderate from "./moderate";

export const metadata = { title: "Reviews", robots: { index: false } };

/** Admin only: approve reviews before they appear on the homepage. */
const Page = async () => {
    const user = await getUser();
    if (user?.user?.role !== "ADMIN") return redirect("/404");

    const [pending, approved] = await Promise.all([
        db.reviews.list(false),
        db.reviews.list(true),
    ]);
    const row = (r: (typeof pending)[number]) => ({
        printId: r.printId,
        rating: r.rating,
        text: r.text,
        email: r.email,
        createdAt: r.createdAt.toISOString().slice(0, 10),
    });

    return (
        <Main>
            <Moderate pending={pending.map(row)} approved={approved.map(row)} />
        </Main>
    );
};

export default Page;
