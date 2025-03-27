"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type ChipProps = {
    text: string;
    selected: boolean;
    setSelected: (text: string) => void;
};

const tabs = ["Negro", "Nigga", "Niggers"];

const ChipTabs: React.FC = () => {
    const [selected, setSelected] = useState(tabs[0]);

    return (
        <div className="flex items-center flex-wrap gap-2">
            {tabs.map((tab) => (
                <Chip
                    text={tab}
                    selected={selected === tab}
                    setSelected={setSelected}
                    key={tab}
                />
            ))}
        </div>
    );
};

const Chip: React.FC<ChipProps> = ({ text, selected, setSelected }) => {
    return (
        <button
            onClick={() => setSelected(text)}
            className={`${
                selected ? "text-white" : "hover:bg-base-100 "
            } transition-colors px-3 py-1 rounded-full relative`}
        >
            <span className="relative z-10">{text}</span>
            {selected && (
                <motion.span
                    layoutId="pill-tab"
                    transition={{ type: "spring", duration: 0.5 }}
                    className="absolute inset-0 z-0 bg-secondary rounded-full"
                ></motion.span>
            )}
        </button>
    );
};

export default ChipTabs;
