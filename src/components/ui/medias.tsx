"use client";

import type { Image } from "@prisma/client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Info, X } from "lucide-react";
import type { User } from "lucia";
import InfiniteScroll from "react-infinite-scroller";
import GirlImage from "@/components/ui/girl-image";
import { cn, formatNumber } from "@/lib/utils";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export type MediaProps = Image;

export type MediasProps = {
    user: User | null;
    medias: MediaProps[];
};

const BASE_ELEMENTS = 20;

const Medias: React.FC<MediasProps> = ({ user, medias }) => {
    const t = useTranslations();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [media, setMedia] = useState<MediaProps | null>(null);
    const [visibleMedias, setVisibleMedias] = useState<MediaProps[]>(
        medias.slice(0, BASE_ELEMENTS)
    );
    const [likedMedias, setLikedMedias] = useState<Set<string>>(
        new Set(user?.likedMedias || [])
    );
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>(
        medias.reduce(
            (acc, media) => {
                acc[media.id] = media.likes;
                return acc;
            },
            {} as Record<string, number>
        )
    );
    const [isLiking, setIsLiking] = useState<Record<string, boolean>>({});

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

    useEffect(() => {
        setVisibleMedias(medias.slice(0, BASE_ELEMENTS));
        setLikeCounts(
            medias.reduce(
                (acc, media) => {
                    acc[media.id] = media.likes;
                    return acc;
                },
                {} as Record<string, number>
            )
        );
    }, [medias]);

    const handleLike = async (mediaId: string) => {
        if (!user || isLiking[mediaId]) {
            if (!user) {
                toast(t("messages.loginLike"), {
                    icon: <Info className="text-blue-400" />,
                });
            }
            return;
        }

        setIsLiking((prev) => ({ ...prev, [mediaId]: true }));

        const isCurrentlyLiked = likedMedias.has(mediaId);
        const newLikedMedias = new Set(likedMedias);

        if (isCurrentlyLiked) {
            newLikedMedias.delete(mediaId);
            setLikeCounts((prev) => ({
                ...prev,
                [mediaId]: prev[mediaId] - 1,
            }));
        } else {
            newLikedMedias.add(mediaId);
            setLikeCounts((prev) => ({
                ...prev,
                [mediaId]: prev[mediaId] + 1,
            }));
        }

        setLikedMedias(newLikedMedias);

        try {
            const response = await fetch("/api/like", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mediaId,
                    action: isCurrentlyLiked ? "unlike" : "like",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update like");
            }

            const data = await response.json();

            setLikeCounts((prev) => ({ ...prev, [mediaId]: data.likes }));
        } catch (error) {
            console.error("Error updating like:", error);

            if (isCurrentlyLiked) {
                newLikedMedias.add(mediaId);
                setLikeCounts((prev) => ({
                    ...prev,
                    [mediaId]: prev[mediaId] + 1,
                }));
            } else {
                newLikedMedias.delete(mediaId);
                setLikeCounts((prev) => ({
                    ...prev,
                    [mediaId]: prev[mediaId] - 1,
                }));
            }
            setLikedMedias(newLikedMedias);
        } finally {
            setIsLiking((prev) => ({ ...prev, [mediaId]: false }));
        }
    };

    const openModal = (media: MediaProps) => {
        setMedia(media);
        setIsModalOpen(true);
    };

    const handleCloseModal = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsModalOpen(false);
        setMedia(null);
    };

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
                loader={<Loading key="loading" />}
            >
                <div className="columns-3 gap-1">
                    {visibleMedias.map((mediaItem) => (
                        <div
                            key={mediaItem.id}
                            className="m-[0.5px] py-[2px] overflow-hidden rounded-sm relative"
                        >
                            <div className="pointer-events-none absolute right-0 left-0 top-0 h-12 w-full bg-gradient-to-b from-neutral-950/70 to-neutral-950/0 z-30" />
                            <div className="absolute top-0 left-0 z-50 w-full m-2">
                                <button
                                    className="flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLike(mediaItem.id);
                                    }}
                                >
                                    <Heart
                                        className={cn(
                                            "size-6 transition-colors",
                                            likedMedias.has(mediaItem.id) ?
                                                "text-primary fill-primary"
                                            :   "text-primary",
                                            isLiking[mediaItem.id] &&
                                                "animate-pulse"
                                        )}
                                    />
                                    <span className="text-white">
                                        {formatNumber(
                                            likeCounts[mediaItem.id] ||
                                                mediaItem.likes
                                        )}
                                    </span>
                                </button>
                            </div>
                            <div
                                className="shadow-md cursor-pointer"
                                onClick={() => openModal(mediaItem)}
                            >
                                <GirlImage image={mediaItem} user={user} />
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
                        className="fixed inset-0 h-screen w-full flex items-center justify-center z-[9999] bg-base-300/50 backdrop-blur-lg sm:p-2"
                    >
                        <div className="absolute left-0 top-0 p-4 w-full flex justify-between z-[9999]">
                            <div>
                                <p className="text-lg">{media.description}</p>
                                <p className="text-sm text-neutral">
                                    {media.tags
                                        .map((tag) => `#${tag}`)
                                        .join(" ")}
                                </p>
                                <button
                                    className="mt-2 flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLike(media.id);
                                    }}
                                >
                                    <Heart
                                        className={cn(
                                            "size-6 transition-colors",
                                            likedMedias.has(media.id) ?
                                                "text-primary fill-primary"
                                            :   "text-primary",
                                            isLiking[media.id] &&
                                                "animate-pulse"
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            "transition-colors",
                                            likedMedias.has(media.id) ?
                                                "text-primary"
                                            :   ""
                                        )}
                                    >
                                        {formatNumber(
                                            likeCounts[media.id] || media.likes
                                        )}
                                    </span>
                                </button>
                            </div>
                            <button
                                className="btn btn-ghost btn-square btn-sm"
                                onClick={handleCloseModal}
                            >
                                <X className="size-6" />
                            </button>
                        </div>

                        <div className="">
                            <div className="w-[80vw] h-[80vh] w flex items-center justify-center">
                                <GirlImage
                                    image={media}
                                    user={user}
                                    className="object-contain size-full rounded-xl"
                                />
                            </div>
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
