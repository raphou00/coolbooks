"use client";

import { useTranslations } from "next-intl";
import type { User } from "lucia";
import Medias, { type MediaProps } from "@/components/ui/medias";
import Title from "@/components/ui/title";
import { Search, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGetSorts } from "@/config/links";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { name } from "@/config/seo";

type ExploreProps = {
    user: User | null;
    allMedias: MediaProps[];
};

const Explore: React.FC<ExploreProps> = ({ allMedias, user }) => {
    const t = useTranslations("pages.explore");
    const [search, setSearch] = useState("");
    const [medias, setMedias] = useState<MediaProps[]>(allMedias);
    const [tag, setTag] = useState<string>("");
    const [showFavorites, setShowFavorites] = useState<boolean>(false);
    const sorts = useGetSorts();
    const [sort, setSort] = useState<(typeof sorts)[number]>(sorts[0]);
    const searchParams = useSearchParams();
    const q = searchParams.get("q") || "";

    const applyFilters = (searchTerm: string, selectedTag: string, selectedSort: (typeof sorts)[number], favoritesOnly: boolean) => {
        let filteredMedias = [...allMedias];

        // Apply favorites filter first
        if (favoritesOnly && user?.likedMedias) {
            filteredMedias = filteredMedias.filter((media) =>
                user.likedMedias.includes(media.id)
            );
        }

        if (searchTerm) {
            const searchRegex = new RegExp(searchTerm.toLowerCase(), "i");
            filteredMedias = filteredMedias.filter(
                (media) =>
                    searchRegex.test(media.description.toLowerCase()) ||
                    media.tags.some((tag) => searchRegex.test(tag.toLowerCase()))
            );
        }

        if (selectedTag) {
            filteredMedias = filteredMedias.filter((media) =>
                media.tags.includes(selectedTag)
            );
        }

        if (selectedSort) {
            filteredMedias = applySortToMedias(filteredMedias, selectedSort);
        }

        return filteredMedias;
    };

    const applySortToMedias = (mediasToSort: MediaProps[], sortOption: (typeof sorts)[number]) => {
        const sortedMedias = [...mediasToSort];

        switch (sortOption.path) {
            case "newest":
                return sortedMedias.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            case "oldest":
                return sortedMedias.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
            case "popular":
                return sortedMedias.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            default:
                return sortedMedias;
        }
    };

    const handleSearch = (searchTerm: string) => {
        setSearch(searchTerm);
        const filteredMedias = applyFilters(searchTerm, tag, sort, showFavorites);
        setMedias(filteredMedias);
    };

    const handleSort = (sortPath: string) => {
        const selectedSort = sorts.find((s) => s.path === sortPath);
        if (!selectedSort) return;
        
        setSort(selectedSort);
        const filteredMedias = applyFilters(search, tag, selectedSort, showFavorites);
        setMedias(filteredMedias);
    };

    const handleTag = (selectedTag: string) => {
        if (tag === selectedTag) {
            setTag("");
            const filteredMedias = applyFilters(search, "", sort, showFavorites);
            setMedias(filteredMedias);
        } else {
            setTag(selectedTag);
            const filteredMedias = applyFilters(search, selectedTag, sort, showFavorites);
            setMedias(filteredMedias);
        }
    };

    const handleFavorites = () => {
        const newShowFavorites = !showFavorites;
        setShowFavorites(newShowFavorites);
        const filteredMedias = applyFilters(search, tag, sort, newShowFavorites);
        setMedias(filteredMedias);
    };

    useEffect(() => {
        handleSearch(q);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const allTags = allMedias.reduce(
        (tags, media) => [...tags, ...media.tags],
        [] as string[]
    );
    const tagCounts = allTags.reduce(
        (counts, tag) => {
            counts[tag] = (counts[tag] || 0) + 1;
            return counts;
        },
        {} as Record<string, number>
    );
    const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);

    return (
        <>
            <div className="flex flex-col items-center justify-center gap-y-6 mb-6">
                <div className="flex items-center gap-x-2">
                    <Title
                        text={t("description", { name })}
                        className="text-xl md:text-2xl lg:text-3xl"
                        underline
                    />
                </div>
                <div className="w-full max-w-[500px]">
                    <div className="relative w-full">
                        <input
                            type="text"
                            className="input input-lg input-bordered w-full border-2 bg-base-100 tracking-wide transition placeholder:text-neutral-400 focus:border-neutral focus:outline-none focus:bg-base-300 pl-5 pr-9"
                            placeholder={t("search-placeholder")}
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            spellCheck={false}
                            autoComplete="off"
                            autoCapitalize="off"
                            autoCorrect="off"
                        />
                        <button className="cursor-pointer z-20 size-9 bg-secondary rounded-full flex items-center justify-center absolute right-0 top-1/2 mx-1.5 -translate-y-1/2">
                            <Search className="size-5 text-white" />
                        </button>
                    </div>
                </div>
                <div className="navbar w-full">
                    <div className="navbar-start">
                        <div>
                            <button
                                className={cn(
                                    "btn btn-sm btn-outline flex items-center gap-2",
                                    showFavorites && "btn-primary btn-active"
                                )}
                                onClick={handleFavorites}
                            >
                                <Heart className={cn("size-4", showFavorites && "text-white fill-white")} />
                                <span className={cn("font-bold", showFavorites && "text-white")}>{t("favorites")}</span>
                            </button>
                        </div>
                    </div>
                    <div className="navbar-center">
                        <div className="flex flex-wrap gap-x-1 gap-y-1">
                            {topTags.map((t) => (
                                <button
                                    key={t}
                                    className={cn(
                                        "btn btn-sm btn-outline",
                                        tag == t && "btn-primary btn-active"
                                    )}
                                    onClick={() => {
                                        handleTag(t);
                                    }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="navbar-end">
                        <div className="w-fit">
                            <Select
                                defaultValue={sorts[0].path}
                                value={sort.path}
                                onValueChange={(l) => handleSort(l)}
                            >
                                <SelectTrigger className="w-full border">
                                    <SelectValue placeholder={sort.title} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {sorts.map((l) => (
                                            <SelectItem key={l.path} value={l.path}>
                                                <div className="flex items-center gap-2">
                                                    {l.title}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
            <Medias medias={medias} user={user || null} />
        </>
    );
};

export default Explore;