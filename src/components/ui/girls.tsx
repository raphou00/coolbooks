"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BadgeCheck, Heart } from "lucide-react";
import type { Media, Girl, Image, Video } from "@prisma/client";
import { formatAmountForDisplay } from "@/lib/utils";
import { Link, useRouter } from "@/lib/navigation";
import useWindowSize from "@/hook/use-window-size";
import { useCurrency } from "@/hook/use-currency";
import ImageEl from "./image";
import Modal from "./modal";
import Title from "./title";
import VideoEl from "./video";

type MediaProps = Media & {
    images: Image[];
    videos: Video[];
};

export type GirlWithMedia = Girl & { medias: MediaProps[] };

type GirlsProps = {
    girls: GirlWithMedia[];
};

const MAX_WIDTH = 768;

const Girls: React.FC<GirlsProps> = ({ girls }) => {
    const t = useTranslations("pages.girls");
    const [girl, setModel] = useState<GirlWithMedia | undefined>();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const router = useRouter();
    const windowSize = useWindowSize();
    const { currency, convert } = useCurrency();

    const openModal = (username: string) => {
        if (windowSize.width < MAX_WIDTH) {
            router.push(`/${username}`);
            return;
        }
        const girl = girls.find((girl) => girl.username === username);
        setModel(girl);
        setModalOpen(true);
    };

    useEffect(() => {
        if (windowSize.width < MAX_WIDTH) {
            setModalOpen(false);
        }
    }, [windowSize]);

    const girlMedias =
        girl ?
            girl.medias.flatMap((media) => [...media.images, ...media.videos])
        :   [];

    return (
        <>
            <div className="mx-auto">
                <div className="grid gap-x-6 gap-y-6 grid-cols-2 sm:grid-cols-4">
                    {girls.map((girl) => (
                        <button
                            key={girl.id}
                            onClick={() => openModal(girl.username)}
                            className="group flex flex-col"
                        >
                            <div className="relative overflow-hidden rounded-xl">
                                <ImageEl
                                    alt={girl.name}
                                    src={girl.avatar}
                                    className="w-full aspect-[7/8] rounded-xl object-cover group-hover:scale-105"
                                    width={256}
                                    height={256}
                                />
                            </div>
                            <div className="flex max-lg:flex-col max-lg:items-start justify-between items-center gap-y-1 mt-2">
                                <div className="flex items-center gap-x-1">
                                    <BadgeCheck className="text-white fill-blue-500" />
                                    <Title
                                        text={girl.name}
                                        className="text-md lg:text-lg overflow-hidden text-ellipsis whitespace-nowrap max-w-[400px]"
                                    />
                                </div>

                                <div className="flex items-center gap-x-1">
                                    <Heart className="size-5 fill-red-500 text-red-500" />
                                    <span className="text-sm text-neutral">
                                        {girl.likes}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm md:text-base text-left text-base-content/60 font-bold">
                                {girl.tags.map((tag) => `#${tag}`).join(" ")}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
            <Modal
                isOpen={modalOpen}
                setIsOpen={setModalOpen}
                className="w-full h-full max-h-[80vh] max-md:hidden"
            >
                {girl && (
                    <div className="flex flex-col items-start gap-y-6">
                        <div className="size-40 w-full flex gap-x-4">
                            <ImageEl
                                src={girl!.avatar}
                                alt={girl!.name}
                                width={256}
                                height={256}
                                className="size-40 rounded-xl object-cover user-select-none pointer-events-none"
                            />
                            <div className="flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-x-1">
                                        <Heart className="size-5 fill-red-500 text-red-500" />
                                        <span className="text-sm text-neutral">
                                            {girl.likes}
                                        </span>
                                    </div>
                                    <p className="pt-0.5 text-2xl">
                                        <div className="flex items-center gap-x-1">
                                            <BadgeCheck className="text-white fill-blue-500" />
                                            <Title
                                                text={girl.name}
                                                className="text-md lg:text-lg"
                                            />
                                            <span className="text-neutral">
                                                {" "}
                                                -{" "}
                                                {formatAmountForDisplay(
                                                    convert(girl!.price),
                                                    currency
                                                )}
                                            </span>
                                        </div>
                                    </p>
                                    <p className="text-sm md:text-base text-left text-base-content/60 font-bold">
                                        {girl.tags
                                            .map((tag) => `#${tag}`)
                                            .join(" ")}
                                    </p>
                                    <p className="pt-0.5 text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-[400px]">
                                        {girl?.bio}
                                    </p>
                                </div>
                                <Link
                                    href={`/${girl?.username}`}
                                    className="btn btn-sm btn-secondary mt-4 w-fit"
                                >
                                    {t("profile")}
                                </Link>
                            </div>
                        </div>
                        <div className="h-40">
                            <div className="flex items-center gap-x-4">
                                <Title
                                    text={t("gallery")}
                                    className="w-min mb-2"
                                    underline
                                />
                                <p>{t("check", { name: girl?.name })}</p>
                            </div>
                            <div className="w-full h-80 overflow-y-auto rounded-xl">
                                <div className="gap-4 columns-2 md:columns-3">
                                    {girlMedias?.slice(0, 12).map((m) => (
                                        <div key={m.id} className="mb-4">
                                            {m && "time" in m ?
                                                <VideoEl
                                                    video={m as Video}
                                                    description={""}
                                                    bought
                                                />
                                            :   <ImageEl
                                                    src={m.src}
                                                    alt={girl!.name}
                                                    width={m.width}
                                                    height={m.height}
                                                    className="w-full rounded-lg"
                                                />
                                            }
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default Girls;
