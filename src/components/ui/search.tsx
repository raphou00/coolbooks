"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SearchIcon } from "lucide-react";
import { useGetPlaceholders } from "@/config/links";

const Search: React.FC = () => {
    const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
    const [value, setValue] = useState("");
    const placeholders = useGetPlaceholders();

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const onSubmit = () => {
        window.location.replace(`/search?q=${value}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSubmit();
        }
    };

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
        }, 3000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [placeholders]);

    return (
        <div className="w-full relative mx-auto bg-black/70 h-12 mr-2 rounded-full overflow-hidden shadow transition duration-200">
            <input
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                ref={inputRef}
                value={value}
                type="text"
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

            <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
                <AnimatePresence mode="wait">
                    {!value && (
                        <motion.p
                            initial={{
                                y: 5,
                                opacity: 0,
                            }}
                            key={`current-placeholder-${currentPlaceholder}`}
                            animate={{
                                y: 0,
                                opacity: 1,
                            }}
                            exit={{
                                y: -15,
                                opacity: 0,
                            }}
                            transition={{
                                duration: 0.3,
                                ease: "linear",
                            }}
                            className="text-sm sm:text-base font-normal text-white/80 pl-4 sm:pl-6 text-left w-[calc(100%-2rem)] truncate"
                        >
                            {placeholders[currentPlaceholder]}...
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Search;
