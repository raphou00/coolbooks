import type { Metadata } from "next";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import Main from "@/components/layout/main";
import { CreateGirl, CreateImage, CreateMedia, CreateVideo } from "./girls";

const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: "Admin",
    };
};

const Page = async () => {
    const user = await getUser();

    if (user?.user?.role !== "ADMIN") {
        return redirect("/");
    }

    const girls = await db.girl.findMany({
        select: {
            id: true,
            name: true,
            medias: true,
        },
    });

    return (
        <Main>
            <div className="max-w-md mx-auto flex flex-wrap">
                <CreateGirl />
                <div className="w-full h-px bg-neutral my-8" />
                <CreateMedia girls={girls} />
                <div className="w-full h-px bg-neutral my-8" />
                <CreateImage girls={girls} />
                <div className="w-full h-px bg-neutral my-8" />
                <CreateVideo girls={girls} />
            </div>
        </Main>
    );
};

export { generateMetadata };
export default Page;
