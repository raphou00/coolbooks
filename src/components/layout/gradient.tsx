import { cn } from "@/lib/utils";

type ComponentLayoutProps = {
    children: React.ReactNode;
    gradientVariant?: "heroGradient" | "floatingGradient";
};

type FloatingGradientProps = {
    className?: string;
};

const HeroGradient: React.FC<FloatingGradientProps> = () => {
    return (
        <svg
            className="w-full"
            width="1920"
            height="640"
            viewBox="0 0 1920 640"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
        >
            <rect
                width="1920"
                height="658"
                fill="url(#paint0_radial_302_170)"
            ></rect>
            <mask
                id="mask0_302_170"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="1920"
                height="658"
            >
                <rect width="1920" height="658" fill="white"></rect>
            </mask>
            <g mask="url(#mask0_302_170)">
                <g filter="url(#filter0_f_302_170)">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M1547.41 -107.698L1091.36 445.473L1090.14 62.3922L1547.41 -107.698Z"
                        fill="url(#paint1_linear_302_170)"
                    ></path>
                </g>
            </g>
            <defs>
                <filter
                    id="filter0_f_302_170"
                    x="954.223"
                    y="-243.612"
                    width="729.097"
                    height="824.999"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood
                        floodOpacity="0"
                        result="BackgroundImageFix"
                    ></feFlood>
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    ></feBlend>
                    <feGaussianBlur
                        stdDeviation="67.957"
                        result="effect1_foregroundBlur_302_170"
                    ></feGaussianBlur>
                </filter>
                <radialGradient
                    id="paint0_radial_302_170"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="translate(932.167) rotate(90) scale(688.45 2102.29)"
                >
                    <stop stopColor="#0EA5E9" stopOpacity="0.72"></stop>
                    {/* <stop stopColor="#635bff" stopOpacity="0.72"></stop> */}
                    <stop
                        offset="0.223497"
                        stopColor="#ff00bdff"
                        stopOpacity="0.4"
                    ></stop>
                    <stop offset="1" stopColor="#000" stopOpacity="0.01"></stop>
                </radialGradient>
                <linearGradient
                    id="paint1_linear_302_170"
                    x1="1255.18"
                    y1="-9.93911"
                    x2="559.316"
                    y2="92.2741"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#ff00bdff"></stop>
                    <stop
                        offset="1"
                        stopColor="#0EA5E9"
                        stopOpacity="0.01"
                    ></stop>
                </linearGradient>
            </defs>
        </svg>
    );
};

const FloatingGradientLeft: React.FC<FloatingGradientProps> = () => {
    return (
        <svg
            className="-z-50 origin-center overflow-visible"
            width="887"
            height="658"
            viewBox="0 0 887 658"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
        >
            <g filter="url(#filter0_f_1004_2)">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M136 136L750.667 469.183L372 521.553L136 136Z"
                    fill="url(#paint0_linear_1004_2)"
                ></path>
            </g>
            <defs>
                <filter
                    id="filter0_f_1004_2"
                    x="0.085907"
                    y="0.085907"
                    width="886.495"
                    height="657.381"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood
                        floodOpacity="0"
                        result="BackgroundImageFix"
                    ></feFlood>
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    ></feBlend>
                    <feGaussianBlur
                        stdDeviation="67.957"
                        result="effect1_foregroundBlur_1004_2"
                    ></feGaussianBlur>
                </filter>
                <linearGradient
                    id="paint0_linear_1004_2"
                    x1="-6.10446"
                    y1="250.66"
                    x2="72.7636"
                    y2="604.216"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#0EA5E9"></stop>
                    <stop
                        offset="1"
                        stopColor="#ff00bdff"
                        stopOpacity="0.01"
                    ></stop>
                </linearGradient>
            </defs>
        </svg>
    );
};

const FloatingGradientRight: React.FC<FloatingGradientProps> = () => {
    return (
        <svg
            className="-z-50 origin-center overflow-visible"
            width="887"
            height="658"
            viewBox="0 0 887 658"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
        >
            <g filter="url(#filter0_f_1004_3)">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M136 521.553L750.667 188.37L372 136L136 521.553Z"
                    fill="url(#paint0_linear_1004_3)"
                ></path>
            </g>
            <defs>
                <filter
                    id="filter0_f_1004_3"
                    x="0.085907"
                    y="0.085907"
                    width="886.495"
                    height="657.381"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood
                        floodOpacity="0"
                        result="BackgroundImageFix"
                    ></feFlood>
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    ></feBlend>
                    <feGaussianBlur
                        stdDeviation="67.957"
                        result="effect1_foregroundBlur_1004_3"
                    ></feGaussianBlur>
                </filter>
                <linearGradient
                    id="paint0_linear_1004_3"
                    x1="-6.10446"
                    y1="406.893"
                    x2="72.7636"
                    y2="53.3368"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#0EA5E9"></stop>
                    <stop
                        offset="1"
                        stopColor="#ff00bdff"
                        stopOpacity="0.01"
                    ></stop>
                </linearGradient>
            </defs>
        </svg>
    );
};

const Gradient: React.FC<ComponentLayoutProps> = ({
    gradientVariant,
    children,
}) => {
    const gradient =
        gradientVariant === "heroGradient" ? <HeroGradient />
        : gradientVariant === "floatingGradient" ?
            <div className="absolute inset-0 overflow-hidden">
                <FloatingGradientLeft className="absolute -left-20 top-0" />
                <FloatingGradientRight className="absolute -right-96 -bottom-0" />
            </div>
        :   null;

    return (
        <>
            <div className="z-40 size-full">{children}</div>
            {gradient && (
                <div className={cn("absolute z-30 inset-0")}>{gradient}</div>
            )}
        </>
    );
};

export default Gradient;
