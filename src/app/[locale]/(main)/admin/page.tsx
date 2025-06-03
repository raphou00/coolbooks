import type { Metadata } from "next";
import db from "@/lib/db";
import Main from "@/components/layout/main";
import { CreateImage, CreateMedia, CreateVideo } from "./admin";
import { findAllMedias } from "@/config/girl";

const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: "Admin",
    };
};

const Page = async () => {
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
