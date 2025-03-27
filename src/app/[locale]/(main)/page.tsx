import { getTranslations } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import { type Creator } from "@prisma/client";
import { Link } from "@/lib/navigation";
import Main from "@/components/layout/main";
import Title from "@/components/ui/title";
import Models from "@/components/ui/creators";
import Top from "@/components/ui/top";
import { Carousel, Card } from "@/components/ui/carousel";

const popular: Creator[] = Array.from({ length: 4 }, (_, i) => ({
    id: i === 0 ? "1dab5116-4763-486a-b40a-fc4e5b01819f" : i.toString(),
    name: `Creator ${i}`,
    avatar: "/images/creator.jpeg",
    cover: "/images/creator.jpeg",
    medias: ["/images/creator.jpeg"],
    price: 9.99,
    origin: "United States",
    bought: 100,
    description: "Hi, I'm Creator ❤️. I'm 21 years old. and from Florida",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
}));

const recommended: Creator[] = Array.from({ length: 4 }, (_, i) => ({
    id: i.toString(),
    name: `Creator ${i}`,
    avatar: "/images/creator.jpeg",
    cover: "/images/creator.jpeg",
    medias: ["/images/creator.jpeg"],
    price: 9.99,
    origin: "United States",
    bought: 100,
    description: "Hi, I'm Creator ❤️. I'm 21 years old. and from Florida",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
}));

const top: Creator[] = Array.from({ length: 5 }, (_, i) => ({
    id: i.toString(),
    name: `Negro ${i}`,
    avatar: "/images/creator.jpeg",
    cover: "/images/creator.jpeg",
    medias: ["/images/creator.jpeg"],
    origin: "United States",
    description: "Hi, I'm Creator ❤️. I'm 21 years old. and from Florida",
    price: 9.99,
    bought: 100,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
}));

const carousel = [
    {
        id: "1dab5116-4763-486a-b40a-fc4e5b01819f",
        category: "creator",
        title: "Creator",
        src: "/images/creator.jpeg",
    },
    {
        id: "1dab5116-4763-486a-b40a-fc4e5b01819f",
        category: "creator",
        title: "Creator",
        src: "/images/creator.jpeg",
    },
    {
        id: "1dab5116-4763-486a-b40a-fc4e5b01819f",
        category: "creator",
        title: "Creator",
        src: "/images/creator.jpeg",
    },

    {
        id: "1dab5116-4763-486a-b40a-fc4e5b01819f",
        category: "creator",
        title: "Creator",
        src: "/images/creator.jpeg",
    },
];

const Page = async () => {
    const t = await getTranslations("pages.home");

    const cards = carousel.map((card, index) => (
        <Card key={card.src} card={card} index={index} />
    ));

    return (
        <Main>
            <div className="w-full h-full">
                <Carousel items={cards} />
            </div>
            <div className="mb-6 mt-1">
                <div className="flex items-center justify-start gap-x-10 mb-6">
                    <Title
                        text={t("popular")}
                        className="text-xl md:text-2xl lg:text-3xl"
                        underline
                    />

                    <Link
                        href="/creators"
                        className="group flex link link-hover link-primary"
                    >
                        {t("more")}
                        <ChevronRight className="size-6 transition group-hover:translate-x-1" />
                    </Link>
                </div>
                <Models creators={popular} />
            </div>

            <div className="my-10">
                <div className="flex items-center justify-center gap-x-10 mb-6">
                    <Title
                        text={t("top-creators")}
                        className="text-2xl md:text-3xl lg:text-4xl"
                        underline
                    />
                </div>
                <Top top={top} />
            </div>

            <div className="my-12">
                <div className="flex items-center justify-start gap-x-10 mb-6">
                    <Title
                        text={t("recommended")}
                        className="text-xl md:text-2xl lg:text-3xl"
                        underline
                    />

                    <Link
                        href="/creators"
                        className="group flex link link-hover link-primary"
                    >
                        {t("more")}
                        <ChevronRight className="size-6 transition group-hover:translate-x-1" />
                    </Link>
                </div>
                <Models creators={recommended} />
            </div>
        </Main>
    );
};

export default Page;
