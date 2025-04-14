import { getTranslations } from "next-intl/server";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { Link } from "@/lib/navigation";
import { findGirlsWithMedias } from "@/config/girl";
import Main from "@/components/layout/main";
import Title from "@/components/ui/title";
import Girls, { type GirlWithMedia } from "@/components/ui/girls";
import { Carousel, Card } from "@/components/ui/carousel";

const Page = async () => {
    const t = await getTranslations("pages.home");
    const user = await getUser();

    const popular = await db.girl.findMany({
        orderBy: {
            likes: "desc",
        },
        take: 4,
        select: findGirlsWithMedias,
    });

    const recommended = await db.girl.findMany({
        orderBy: {
            medias: {
                _count: "desc",
            },
        },
        take: 4,
        select: findGirlsWithMedias,
    });

    const carousel = await db.girl.findMany({
        orderBy: { likes: "desc" },
        take: 5,
    });

    const cards = carousel.map((card, index) => (
        <Card
            key={card.cover}
            index={index}
            card={{
                id: card.username,
                src: card.cover,
                name: card.name,
                tags: card.tags,
            }}
        />
    ));

    return (
        <Main>
            <div className="w-full h-full">
                <Carousel items={cards} />
            </div>
            <div className="mb-6 mt-1">
                <div className="flex items-center justify-start gap-x-10 mb-6">
                    <div className="flex items-center gap-x-2">
                        <Heart className="size-6 text-secondary fill-primary" />
                        <Title
                            text={
                                user ?
                                    t("your-favorites")
                                :   t("people-favorites")
                            }
                            className="text-lg md:text-xl lg:text-2xl"
                        />
                    </div>

                    <Link
                        href="/favorites"
                        className="group flex items-center gap-1 link link-hover link-primary"
                    >
                        {t("more")}
                        <ArrowRight className="size-5 transition group-hover:translate-x-1" />
                    </Link>
                </div>
                <Girls girls={popular as GirlWithMedia[]} />
            </div>

            <div className="my-12">
                <div className="flex items-center justify-start gap-x-10 mb-6">
                    <div className="flex items-center gap-x-2">
                        <Sparkles className="size-6 text-secondary fill-primary" />
                        <Title
                            text={t("recommended")}
                            className="text-lg md:text-xl lg:text-2xl"
                        />
                    </div>

                    <Link
                        href="/girls"
                        className="group flex items-center gap-1 link link-hover link-primary"
                    >
                        {t("more")}
                        <ArrowRight className="size-5 transition group-hover:translate-x-1" />
                    </Link>
                </div>
                <Girls girls={recommended as GirlWithMedia[]} />
            </div>
        </Main>
    );
};

export default Page;
