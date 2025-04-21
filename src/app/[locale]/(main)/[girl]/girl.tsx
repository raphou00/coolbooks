"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Image, Video } from "@prisma/client";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { User } from "lucia";
import confetti from "canvas-confetti";
import { formatAmountForDisplay, getImage } from "@/lib/utils";
import { Link } from "@/lib/navigation";
import Title from "@/components/ui/title";
import ImageEl from "@/components/ui/image";
import GirlVideo from "@/components/ui/girl-video";
import GirlImage from "@/components/ui/girl-image";
import type { GirlWithMedia, MediaProps } from "@/components/ui/girls";

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
    const bought = user?.girls.includes(girl.id) || false;

    const openModal = (media: MediaProps) => {
        setMedia(media);
        setIsModalOpen(true);
    };

    const handleParticles = () => {
        const heart = confetti.shapeFromText({ text: "❤️", scalar: 2 });

        const defaults = {
            spread: 360,
            ticks: 60,
            gravity: 0,
            decay: 0.96,
            startVelocity: 20,
            shapes: [heart],
            scalar: 2,
        };

        confetti({
            ...defaults,
            particleCount: 50,
        });
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
                    className="w-full aspect-[7/2] bg-cover bg-center rounded-xl"
                    style={{
                        backgroundImage: `url('${getImage(girl.cover)}')`,
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
                <div className="flex items-center justify-end mt-2">
                    {user?.girls.includes(girl.id) ?
                        <button
                            onClick={handleParticles}
                            className="btn rounded-full btn-secondary"
                        >
                            {t("payed", { name: girl.name })}
                        </button>
                    :   <Link
                            href={`/payment/${girl.id}`}
                            className="btn rounded-full btn-secondary"
                        >
                            {t("pay", {
                                price: formatAmountForDisplay(girl.price),
                            })}
                        </Link>
                    }
                </div>
                <div className="flex flex-col mt-6 md:mt-8 space-y-2">
                    <div>
                        <Title
                            text={girl.name}
                            className="text-2xl md:text-3xl lg:text-4xl"
                        />
                    </div>
                    <p className="text-sm md:text-base text-base-content">
                        {girl.bio}
                    </p>
                    <p className="text-sm md:text-base text-base-content/70 font-bold">
                        {girl.tags.map((tag) => `#${tag}`).join(" ")}
                    </p>
                </div>
                <div className="w-full overflow-y-scroll rounded-xl mt-6">
                    <div className="gap-4 columns-1 sm:columns-2">
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
                                        girlId={girl.id}
                                        className="w-full h-auto rounded-xl"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {(isModalOpen && media && selectedMedia) && (
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
                                        girlId={girl.id}
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
