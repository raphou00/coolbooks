import { cn } from "@/lib/utils";

type TitleProps = {
    text: string;
    className?: string;
    as?: "h1" | "h2" | "h3" | "h4";
};

/**
 * Editorial headline. Weight stays at 400 — emphasis comes from size and
 * ink contrast, never from bold.
 */
const Title: React.FC<TitleProps> = ({ text, className, as: Tag = "h1" }) => {
    return (
        <Tag className={cn("type-title-lg text-ink text-balance", className)}>
            {text}
        </Tag>
    );
};

export default Title;
