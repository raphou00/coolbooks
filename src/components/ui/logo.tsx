import { cn } from "@/lib/utils";
import { title } from "@/config/seo";
import { BooFace } from "@/components/ui/boo";

type LogoProps = {
    className?: string;
    /** Show the "bibliboo" wordmark instead of Boo's face. */
    withText?: boolean;
    /** Single-colour wordmark (inherits `color`). */
    mono?: boolean;
};

const LETTERS = ["b", "i", "b", "l", "i", "b"] as const;

/**
 * Bibliboo logo. The wordmark bounces in crayon colours and its two o's
 * are Boo's eyes; the mark on its own is Boo's face.
 */
const Logo: React.FC<LogoProps> = ({
    className,
    withText = false,
    mono = false,
}) => {
    if (!withText) {
        return <BooFace className={cn("w-10", className)} title={title} />;
    }

    return (
        <span
            className={cn("wordmark", mono && "wordmark-mono", className)}
            aria-label={title}
            role="img"
        >
            {LETTERS.map((l, i) => (
                <span key={i} aria-hidden>
                    {l}
                </span>
            ))}
            <span className="wordmark-eye" aria-hidden>
                o
            </span>
            <span className="wordmark-eye" aria-hidden>
                o
            </span>
        </span>
    );
};

export default Logo;
