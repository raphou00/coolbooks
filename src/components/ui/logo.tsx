import Image from "next/image";
import { title } from "@/config/seo";
import { cn } from "@/lib/utils";

type LogoProps = {
    className?: string;
};

const Logo: React.FC<LogoProps> = ({ className }) => {
    return (
        <Image
            src="/favicon.svg"
            alt={`Logo ${title}`}
            className={cn("h-20 w-auto", className)}
            width={380}
            height={380}
            priority
        />
    );
};

export default Logo;
