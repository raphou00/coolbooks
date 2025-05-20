import type { Metadata } from "next";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import Main from "@/components/layout/main";
import { CreateImage, CreateMedia, CreateVideo } from "./admin";
import { findAllMedias } from "@/config/girl";

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

    const medias = await db.media.findMany({
        select: findAllMedias,
    });

    return (
        <Main>
            <div className="max-w-md mx-auto flex flex-wrap">
                <CreateMedia medias={medias} />
                <div className="w-full h-px bg-neutral my-8" />
                <CreateImage medias={medias} />
                <div className="w-full h-px bg-neutral my-8" />
                <CreateVideo medias={medias} />
            </div>
        </Main>
    );
};

export { generateMetadata };
export default Page;
