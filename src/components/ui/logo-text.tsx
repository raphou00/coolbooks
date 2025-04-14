"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { title } from "@/config/seo";
import { cn } from "@/lib/utils";

type LogoTextProps = {
    className?: string;
};

const LogoText: React.FC<LogoTextProps> = ({ className }) => {
    const { theme } = useTheme();
    const [rendered, setRendered] = useState(false);

    useEffect(() => {
        setRendered(true);
    }, []);

    return (
        rendered && (
            <Image
                src={theme === "dark" ? "/pinksea-dark.svg" : "/pinksea.svg"}
                alt={`Logo ${title}`}
                className={cn("h-8 w-auto", className)}
                width={256}
                height={256}
            />
        )
    );
};

export default LogoText;
