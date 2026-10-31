import { cn } from "@/lib/utils";

type MainProps = {
    children?: React.ReactNode;
    className?: string;
};

const Main: React.FC<MainProps> = ({ children, className }) => {
    return (
        <main
            className={cn(
                "container-page min-h-[70vh] py-10 md:py-16",
                className
            )}
        >
            {children}
        </main>
    );
};

export default Main;
