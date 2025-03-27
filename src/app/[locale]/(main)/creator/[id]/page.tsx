import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { redirect } from "@/lib/navigation";
import Main from "@/components/layout/main";
import Creator from "@/components/ui/creator";

const Page = async ({ params }: { params: { id: string } }) => {
    const creatorId = params.id;
    const creator = await db.creator.findUnique({
        where: { id: creatorId },
    });
    const user = await getUser();

    if (!creator) {
        redirect("/");
        return null;
    }

    return (
        <Main className="!pt-0">
            <Creator creator={creator} user={user?.user || null} />
        </Main>
    );
};

export default Page;
