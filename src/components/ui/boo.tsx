import { cn } from "@/lib/utils";

export type BooPose = "read" | "sleep" | "wink";

type BooProps = {
    pose?: BooPose;
    className?: string;
    /** Accessible label; omit for decorative use. */
    title?: string;
};

const INK = "#23264a";
const FUR = "#b07a4f";
const FUR_DARK = "#7d5133";
const BELLY = "#f3d2a6";
const NOSE = "#3a2418";

/** Boo's body, head, mouth and book: everything except the eyes. */
const BooBody: React.FC = () => (
    <>
        <ellipse cx="76" cy="188" rx="17" ry="8" fill={FUR_DARK} />
        <ellipse cx="124" cy="188" rx="17" ry="8" fill={FUR_DARK} />
        <ellipse cx="100" cy="140" rx="60" ry="52" fill={FUR} />
        <ellipse cx="100" cy="150" rx="40" ry="36" fill={BELLY} />
        <circle cx="62" cy="44" r="14" fill={FUR} />
        <circle cx="62" cy="44" r="7" fill={FUR_DARK} />
        <circle cx="138" cy="44" r="14" fill={FUR} />
        <circle cx="138" cy="44" r="7" fill={FUR_DARK} />
        <ellipse cx="100" cy="80" rx="50" ry="43" fill={FUR} />
        <ellipse cx="100" cy="96" rx="25" ry="18" fill={BELLY} />
        <circle cx="68" cy="96" r="8" fill="#ff9a8b" opacity=".7" />
        <circle cx="132" cy="96" r="8" fill="#ff9a8b" opacity=".7" />
        {/* buck teeth sit under the smile; the mouth line tucks over them */}
        <path
            d="M95.6 96 H104.4 V103 Q104.4 105.6 101.8 105.6 H98.2 Q95.6 105.6 95.6 103 Z"
            fill="#fff"
            stroke={NOSE}
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
        <line
            x1="100"
            y1="97"
            x2="100"
            y2="105.2"
            stroke={NOSE}
            strokeWidth="1.3"
            strokeLinecap="round"
        />
        <path
            d="M89.5 93.5 Q94.5 98.5 100 95.4 Q105.5 98.5 110.5 93.5"
            fill="none"
            stroke={NOSE}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <line
            x1="100"
            y1="90.5"
            x2="100"
            y2="95.4"
            stroke={NOSE}
            strokeWidth="2.2"
            strokeLinecap="round"
        />
        <ellipse cx="100" cy="87" rx="7.5" ry="5.2" fill={NOSE} />
        <ellipse
            cx="97.6"
            cy="85.4"
            rx="2"
            ry="1.2"
            fill="#fff"
            opacity=".55"
        />
        {/* the book */}
        <path
            d="M52 134 L100 140 L148 134 L148 178 L100 184 L52 178 Z"
            fill="#ff5a47"
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
        />
        <path
            d="M57 131 Q80 126 100 136 L100 177 Q80 168 57 172 Z"
            fill="#fff"
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
        />
        <path
            d="M143 131 Q120 126 100 136 L100 177 Q120 168 143 172 Z"
            fill="#fff"
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
        />
        <path
            d="M67 144 Q78 141 90 146 M67 153 Q78 150 90 155 M110 146 Q122 141 133 144 M110 155 Q122 150 133 153"
            fill="none"
            stroke="#45b3ff"
            strokeWidth="3"
            strokeLinecap="round"
        />
        <path
            d="M121 158 l2.4 5 5.4.6-4 3.7 1.1 5.3-4.9-2.7-4.9 2.7 1.1-5.3-4-3.7 5.4-.6z"
            fill="#ffc93c"
            stroke={INK}
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <ellipse
            cx="52"
            cy="152"
            rx="11"
            ry="9"
            fill={FUR}
            stroke={FUR_DARK}
            strokeWidth="2"
        />
        <ellipse
            cx="148"
            cy="152"
            rx="11"
            ry="9"
            fill={FUR}
            stroke={FUR_DARK}
            strokeWidth="2"
        />
    </>
);

const OpenEye: React.FC<{ cx: number }> = ({ cx }) => (
    <>
        <circle cx={cx} cy="72" r="8" fill={INK} />
        <circle cx={cx + 3} cy="69" r="2.6" fill="#fff" />
    </>
);

const Eyes: React.FC<{ pose: BooPose }> = ({ pose }) => {
    if (pose === "sleep") {
        return (
            <>
                <path
                    d="M74 73 Q82 80 90 73"
                    fill="none"
                    stroke={INK}
                    strokeWidth="3.4"
                    strokeLinecap="round"
                />
                <path
                    d="M110 73 Q118 80 126 73"
                    fill="none"
                    stroke={INK}
                    strokeWidth="3.4"
                    strokeLinecap="round"
                />
                <g
                    className="motion-safe:animate-pulse"
                    fontFamily="var(--font-fredoka), sans-serif"
                    fontWeight="700"
                    fill="#45b3ff"
                >
                    <text x="150" y="40" fontSize="26">
                        z
                    </text>
                    <text x="170" y="22" fontSize="18">
                        z
                    </text>
                </g>
            </>
        );
    }

    if (pose === "wink") {
        return (
            <>
                <OpenEye cx={82} />
                <path
                    d="M109 73.5 Q118 65.5 127 73.5"
                    fill="none"
                    stroke={INK}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                />
                <path
                    d="M163 54 Q164.6 63.4 174 65 Q164.6 66.6 163 76 Q161.4 66.6 152 65 Q161.4 63.4 163 54 Z"
                    fill="#ffc93c"
                    stroke={INK}
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                />
                <path
                    d="M178 40 Q178.8 44.2 183 45 Q178.8 45.8 178 50 Q177.2 45.8 173 45 Q177.2 44.2 178 40 Z"
                    fill="#ffc93c"
                    stroke={INK}
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
                <circle cx="157" cy="45" r="2.4" fill="#45b3ff" />
            </>
        );
    }

    return (
        <>
            <OpenEye cx={82} />
            <OpenEye cx={118} />
        </>
    );
};

/** Boo, the Bibliboo marmot. */
const Boo: React.FC<BooProps> = ({ pose = "read", className, title }) => (
    <svg
        viewBox="0 0 200 200"
        className={cn("h-auto w-full", className)}
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
    >
        <BooBody />
        <Eyes pose={pose} />
    </svg>
);

/** Boo's face only: for avatars, stickers and small spaces. */
export const BooFace: React.FC<{ className?: string; title?: string }> = ({
    className,
    title,
}) => (
    <svg
        viewBox="34 22 132 112"
        className={cn("h-auto w-full", className)}
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
    >
        <BooBody />
        <Eyes pose="read" />
    </svg>
);

export default Boo;
