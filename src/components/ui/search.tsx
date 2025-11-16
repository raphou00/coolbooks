"use client";

import { useRef, useState } from "react";
import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const Search: React.FC = () => {
    const t = useTranslations("messages");
    const [value, setValue] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);

    const onSubmit = () => {
        window.location.replace(`/search?q=${value}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSubmit();
        }
    };

    return (
        <div className="w-full relative mx-auto bg-black/70 h-12 mr-2 rounded-full overflow-hidden shadow transition duration-200">
            <input
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                ref={inputRef}
                value={value}
                type="text"
                placeholder={t("search-placeholder")}
                className="w-full relative text-sm sm:text-base z-50 border-none bg-transparent text-white h-full rounded-full focus:outline-none focus:ring-0 pl-4 sm:pl-6 pr-20"
            />

            <button
                disabled={!value}
                type="submit"
                onClick={onSubmit}
                className="absolute right-1.5 top-1/2 z-50 -translate-y-1/2 size-9 rounded-full bg-primary transition duration-200 flex items-center justify-center cursor-pointer"
            >
                <SearchIcon className="size-6 text-white" />
            </button>
        </div>
    );
};

export default Search;
