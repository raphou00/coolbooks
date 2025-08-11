import type { Metadata } from "next";
import Main from "@/components/layout/main";
import { CreateImage, CreateVideo } from "./admin";

const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: "Admin",
    };
};

const Page = async () => {
    return (
        <Main>
            <div className="max-w-md mx-auto flex flex-wrap">
                <CreateImage />
                <div className="w-full h-px bg-neutral my-8" />
                <CreateVideo />
            </div>
        </Main>
    );
};

export { generateMetadata };
export default Page;
