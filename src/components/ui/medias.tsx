"use client";

import type { Media, Image, Video } from "@prisma/client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { User } from "lucia";
import InfiniteScroll from "react-infinite-scroller";
import GirlImage from "@/components/ui/girl-image";
import GirlVideo from "@/components/ui/girl-video";

export type MediaProps = Media & {
    images: Image[];
    videos: Video[];
};

export type MediasProps = {
    user: User | null;
    medias: MediaProps[];
};

const BASE_ELEMENTS = 20;

const Medias: React.FC<MediasProps> = ({ user, medias }) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [currentMedia, setCurrentMedia] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [media, setMedia] = useState<MediaProps | null>(null);
    const [visibleMedias, setVisibleMedias] = useState<MediaProps[]>(
        medias.slice(0, BASE_ELEMENTS)
    );
    const mediaCount = media ? media.images.length + media.videos.length : 0;

    useEffect(() => {
        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                handleCloseModal();
            }
        };

        document.addEventListener("keydown", handleKeydown);
        return () => {
            document.removeEventListener("keydown", handleKeydown);
        };
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

    const loadFunc = (e: number) => {
        if (!hasMore) {
            return;
        }

        const val = e * 10 + BASE_ELEMENTS;

        const newMedias = medias.slice(0, val);
        setVisibleMedias(newMedias);

        if (val >= medias.length) {
            setHasMore(false);
        }
    };

    return (
        <>
            <InfiniteScroll
                pageStart={0}
                loadMore={loadFunc}
                hasMore={hasMore}
                loader={<Loading />}
                // useWindow={false}
            >
                <div className="masonry-full max-[600px]:masonry-md max-[800px]:masonry">
                    {visibleMedias.map((media) => (
                        <div key={media.id} className="break-inside mb-[0.1em]">
                            <div
                                className="shadow-md"
                                onClick={() => openModal(media)}
                            >
                                {media.images.length > 0 ?
                                    <GirlImage
                                        image={media.images[0]}
                                        user={user}
                                    />
                                : media.videos.length > 0 ?
                                    <GirlVideo
                                        video={media.videos[0]}
                                        user={user}
                                    />
                                :   null}
                            </div>
                        </div>
                    ))}
                </div>
            </InfiniteScroll>

            <AnimatePresence>
                {isModalOpen && media && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 h-screen w-full flex items-center justify-center z-[10000000000] bg-base-300/50 backdrop-blur-lg sm:p-2"
                    >
                        <div className="absolute left-0 top-0 p-4 w-full flex items-center justify-between">
                            <div className="flex flex-col">
                                <p className="text-lg">{media.description}</p>
                                <p className="text-sm text-neutral">
                                    {media.tags
                                        .map((tag) => `#${tag}`)
                                        .join(" ")}
                                </p>
                            </div>
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
                                        user={user}
                                        className="rounded-xl"
                                    />
                                :   <GirlImage
                                        image={selectedMedia as Image}
                                        user={user}
                                        className="object-contain size-full rounded-xl"
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

const Loading: React.FC = () => {
    return (
        <div className="w-full flex flex-col items-center justify-center gap-2 my-4">
            <span className="loading loading-spinner bg-neutral"></span>
        </div>
    );
};

export default Medias;
