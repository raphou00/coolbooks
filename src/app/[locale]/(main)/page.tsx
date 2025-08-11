import db from "@/lib/db";
import Main from "@/components/layout/main";
import Medias, { type MediaProps } from "@/components/ui/medias";
import { findAllMedias } from "@/config/media";
import { getUser } from "@/lib/auth";
import { WelcomeModal } from "./home";

const Page = async () => {
    const user = await getUser();

    const allMedias = await db.image.findMany({
        select: findAllMedias,
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <Main>
            <Medias
                medias={allMedias as MediaProps[]}
                user={user?.user || null}
            />
            <WelcomeModal />
        </Main>
    );
};

export default Page;
