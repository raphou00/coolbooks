"use client";

import { cn } from "@/lib/utils";
import Gradient from "./gradient";

type MainProps = {
    children?: React.ReactNode;
    className?: string;
};

const Main: React.FC<MainProps> = ({ children, className }) => {
    return (
        <main
            className={cn(
                "max-w-7xl min-h-screen w-full py-2 px-4 md:px-6 lg:px-8 xl:px-12 mx-auto",
                className
            )}
        >
            {/* // <Gradient gradientVariant="heroGradient"> */}
            {children}
            {/* // </Gradient> */}
        </main>
    );
};

export default Main;
