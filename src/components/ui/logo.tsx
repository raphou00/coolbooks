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
            className={cn("size-16", className)}
            width={256}
            height={256}
            priority
        />
    );
};

export default Logo;
