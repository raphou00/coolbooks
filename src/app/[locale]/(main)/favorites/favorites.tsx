"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import Title from "@/components/ui/title";
import NoResults from "@/components/ui/no-results";
import Girls, { type GirlWithMedia } from "@/components/ui/girls";

type FavoritesProps = {
    girls: GirlWithMedia[];
};

const Favorites: React.FC<FavoritesProps> = ({ girls: allGirls }) => {
    const t = useTranslations("pages.favorites");
    const [search, setSearch] = useState("");
    const [girls, setGirls] = useState<GirlWithMedia[]>(allGirls);

    const handleSearch = async () => {
        const newGirls = allGirls.filter(
            (girl) =>
                girl.name.toLowerCase().includes(search.toLowerCase()) ||
                girl.origin.toLowerCase().includes(search.toLowerCase()) ||
                girl.tags.some((tag) =>
                    tag.toLowerCase().includes(search.toLowerCase())
                )
        );
        setGirls(newGirls);
    };

    return (
        <>
            <Title
                text={t("search-title")}
                className="text-3xl md:text-4xl lg:text-5xl text-center w-fit mx-auto my-4"
                underline
            />

            <div className="relative max-w-2xl w-full mx-auto mb-10">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyUp={handleSearch}
                    placeholder={t("search-girl")}
                    className="input md:input-lg text-left rounded-full w-full border-2 border-neutral/20 bg-base-100 pr-9 tracking-wide"
                />
                <button
                    className="cursor-pointer size-9 md:size-[50px] bg-secondary rounded-full flex items-center justify-center absolute right-0 top-1/2 mx-1.5 -translate-y-1/2"
                    onClick={handleSearch}
                >
                    <Search className="size-5 md:size-7 text-white" />
                </button>
            </div>

            {girls.length === 0 && <NoResults />}
            <Girls girls={girls} />
        </>
    );
};

export default Favorites;
