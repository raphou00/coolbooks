import Image from "next/image";
import { cn } from "@/lib/utils";
import Title from "./title";

type BentoGridProps = {
    className?: string;
    children?: React.ReactNode;
};

type BentoGridItemProps = {
    title: string;
    description: string;
    header: string;
    icon: React.ReactNode;
    className?: string;
};

export const BentoGrid: React.FC<BentoGridProps> = ({ children }) => {
    return (
        <div className="flex max-lg:flex-col items-center justify-center gap-8 w-full mt-10">
            {children}
        </div>
    );
};

export const BentoGridItem: React.FC<BentoGridItemProps> = ({
    title,
    description,
    header,
    icon,
    className,
}) => {
    return (
        <div
            className={cn(
                "relative group w-full flex flex-col justify-between space-y-4 rounded-2xl border border-neutral/10 p-6 transition duration-200 shadow hover:shadow-xl",
                className
            )}
        >
            <Image
                src={header}
                width={800}
                height={400}
                alt={title}
                className="h-60 w-full rounded-2xl object-cover max-lg:size-60 max-lg:mx-auto"
            />
            <div className="transition duration-200 group-hover:translate-x-2">
                {icon}
                <Title text={title} className="text-lg mt-2" />
                <div className="text-base">{description}</div>
            </div>
        </div>
    );
};
