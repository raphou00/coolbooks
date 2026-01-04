import Image from "next/image";
import { title } from "@/config/seo";
import { cn } from "@/lib/utils";

type LogoTextProps = {
    className?: string;
};

const LogoText: React.FC<LogoTextProps> = ({ className }) => {
    return (
        <Image
            src="/cool-books.svg"
            alt={`Logo Text ${title}`}
            className={cn("h-20 w-auto", className)}
            width={851}
            height={492}
            priority
        />
    );
};

export default LogoText;
