import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import Main from "@/components/layout/main";
import Girls from "./girls";

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

    return (
        <Main>
            <div className="max-w-sm">
                <Girls />
            </div>
        </Main>
    );
};

export { generateMetadata };
export default Page;
