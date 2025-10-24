"use client";

import { cn } from "@/lib/utils";
import Gradient from "./gradient";

type MainProps = {
    children?: React.ReactNode;
    className?: string;
    gradientVariant?: "heroGradient" | "floatingGradient";
};

const Main: React.FC<MainProps> = ({
    children,
    className,
    gradientVariant,
}) => {
    return (
        <main
            className={cn(
                "max-w-8xl min-h-screen w-full py-2 px-4 md:px-6 lg:px-8 xl:px-12 mx-auto pt-14",
                className
            )}
        >
            <Gradient gradientVariant={gradientVariant}>{children}</Gradient>
        </main>
    );
};

export default Main;
