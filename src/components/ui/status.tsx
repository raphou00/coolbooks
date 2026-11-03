import Link from "next/link";
import Logo from "@/components/ui/logo";
import Boo from "@/components/ui/boo";
import { cn } from "@/lib/utils";

type StatusProps = {
    code: string;
    title: string;
    description?: string;
    action: string;
    href?: string;
    fullscreen?: boolean;
};

/** Calm, editorial status screen used by 404 / error pages. */
const Status: React.FC<StatusProps> = ({
    code,
    title,
    description,
    action,
    href = "/",
    fullscreen = false,
}) => (
    <div
        className={cn(
            "container-page flex flex-col items-center justify-center gap-5 py-16 text-center",
            fullscreen ? "min-h-dvh" : "min-h-[60vh]"
        )}
    >
        {fullscreen && (
            <Link href="/" className="mb-6">
                <Logo withText />
            </Link>
        )}
        <div className="w-40 sm:w-48">
            <Boo pose="sleep" />
        </div>
        <p className="type-eyebrow text-muted">{code}</p>
        <h1 className="type-display-lg text-ink max-w-2xl text-balance">
            {title}
        </h1>
        {description && (
            <p className="type-body-lg text-body max-w-lg">{description}</p>
        )}
        <Link href={href} className="button-primary mt-2">
            {action}
        </Link>
    </div>
);

export default Status;
