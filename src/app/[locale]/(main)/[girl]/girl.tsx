"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Image, Video } from "@prisma/client";
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    ImageIcon,
    MapPin,
    X,
    DollarSign
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { User } from "lucia";
import { formatAmountForDisplay, getImage } from "@/lib/utils";
import { Link } from "@/lib/navigation";
import Title from "@/components/ui/title";
import ImageEl from "@/components/ui/image";
import GirlVideo from "@/components/ui/girl-video";
import GirlImage from "@/components/ui/girl-image";
import type { GirlWithMedia, MediaProps } from "@/components/ui/girls";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

type GirlProps = {
    girl: GirlWithMedia;
    user: User | null;
};

const GirlEl: React.FC<GirlProps> = ({ girl, user }) => {
    const t = useTranslations("pages.girl");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [currentMedia, setCurrentMedia] = useState<number>(0);
    const [media, setMedia] = useState<MediaProps | null>(null);
    const mediaCount = media ? media.images.length + media.videos.length : 0;
    const totalMediaCount = girl.medias
        .map((e) => e.images.length + e.videos.length)
        .reduce((a, b) => a + b, 0);
    const bought = user?.girls.includes(girl.id) || false;
    const searchParams = useSearchParams();
    const payment = searchParams.get("payment");
    const tip = searchParams.get("tips");

    useEffect(() => {
        if (payment === "success") {
            toast.success(t("payment-success"));
        } else if (payment === "failed") {
            toast.error(t("payment-failed"));
        } else if (tip === "success") {
            toast.success(t("tips-success"));
        } else if (tip === "failed") {
            toast.error(t("tips-failed"));
        }
    }, []);

    const openModal = (media: MediaProps) => {
        setMedia(media);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setMedia(null);
        setCurrentMedia(0);
    };

    const nextMedia = () => {
        if (currentMedia === mediaCount - 1) {
            setCurrentMedia(0);
        } else {
            setCurrentMedia(currentMedia + 1);
        }
    };

    const prevMedia = () => {
        if (currentMedia === 0) {
            setCurrentMedia(mediaCount - 1);
        } else {
            setCurrentMedia(currentMedia - 1);
        }
    };

    const girlMedias = media ? [...media.images, ...media.videos] : [];
    const selectedMedia = girlMedias[currentMedia];

    return (
        <>
            <div className="max-w-3xl mx-auto overflow-hidden">
                <div
                    className="w-full flex gap-x-4 justify-start items-start aspect-[7/2] bg-cover bg-center rounded-xl p-1 text-white"
                    style={{
                        background: `url('${getImage(girl.cover)}') no-repeat center center / cover`,
                    }}
                />
                <div className="absolute size-32 md:size-40 border-2 border-base-200 rounded-full overflow-hidden translate-x-1/4 -translate-y-1/2">
                    <ImageEl
                        src={girl.avatar}
                        alt={girl.name}
                        width={256}
                        height={256}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex items-center justify-end gap-x-4 mt-2">
                    <Link
                        href={
                            bought ? `/tips/${girl.id}` : `/payment/${girl.id}`
                        }
                        className="btn rounded-full h-11 min-h-11 btn-secondary"
                    >
                        <DollarSign className="size-4 md:size-5" />
                        {bought ?
                            t("tip")
                        :   t("pay", {
                                price: formatAmountForDisplay(girl.price),
                            })
                        }
                    </Link>
                </div>
                <div className="flex flex-col mt-6 md:mt-8 space-y-2">
                    <div className="flex items-center gap-x-2">
                        <Title
                            text={girl.name}
                            className="text-2xl md:text-3xl lg:text-4xl"
                        />
                        <div className="flex items-center gap-x-1 w-fit">
                            <MapPin className=" size-4 md:size-5" />
                            {girl.origin}
                        </div>
                        <div className="flex items-center gap-x-1 w-fit">
                            <Heart className=" size-4 md:size-5" />
                            {girl.likes}
                        </div>
                        <div className="flex items-center gap-x-1 w-fit">
                            <ImageIcon className="size-4 md:size-5" />
                            {totalMediaCount}
                        </div>
                    </div>
                    <p className="text-sm md:text-base text-base-content md:w-1/2">
                        {girl.bio}
                    </p>
                    <p className="text-sm md:text-base text-base-content/70 font-bold">
                        {girl.tags.map((tag) => `#${tag}`).join(" ")}
                    </p>
                </div>
                <div className="w-full overflow-y-scroll rounded-xl mt-6">
                    <div className="w-full gap-1 columns-3">
                        {girl.medias.map((m) => (
                            <div
                                key={m.id}
                                className="flex flex-col cursor-pointer"
                                onClick={() => openModal(m)}
                            >
                                {m.images.length > 0 && (
                                    <GirlImage
                                        image={m.images[0]}
                                        bought={bought}
                                        className="w-full aspect-square rounded-md"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {isModalOpen && media && selectedMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 h-screen w-full flex items-center justify-center z-[10000000000] bg-base-300/50 backdrop-blur-lg sm:p-2"
                    >
                        <div className="absolute left-0 top-0 p-4 w-full flex items-center justify-between">
                            <p className="text-lg">{media.description}</p>
                            <button
                                className="btn btn-ghost btn-square btn-sm"
                                onClick={() => handleCloseModal()}
                            >
                                <X className="size-6" />
                            </button>
                        </div>

                        <div className="">
                            <div className="w-[80vw] h-[80vh] w flex items-center justify-center">
                                {selectedMedia && "time" in selectedMedia ?
                                    <GirlVideo
                                        video={selectedMedia as Video}
                                        bought={bought}
                                        className=""
                                    />
                                :   <GirlImage
                                        image={selectedMedia as Image}
                                        bought={bought}
                                        className="object-contain size-full"
                                    />
                                }
                            </div>
                        </div>

                        <div className="absolute bottom-0 p-4 w-full flex items-center justify-center gap-4">
                            <button
                                className="btn btn-square btn-sm"
                                onClick={prevMedia}
                            >
                                <ChevronLeft className="size-6" />
                            </button>
                            <div>
                                <p className="text-sm space-x-1">
                                    {currentMedia + 1}/{mediaCount}
                                </p>
                            </div>
                            <button
                                className="btn btn-square btn-sm"
                                onClick={nextMedia}
                            >
                                <ChevronRight className="size-6" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default GirlEl;
