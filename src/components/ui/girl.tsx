"use client";

import { useTranslations } from "next-intl";
import type { User } from "lucia";
import type { Video } from "@prisma/client";
import confetti from "canvas-confetti";
import { formatAmountForDisplay, getImage } from "@/lib/utils";
import { Link } from "@/lib/navigation";
import { useCurrency } from "@/hook/use-currency";
import Title from "@/components/ui/title";
import Image from "@/components/ui/image";
import type { GirlWithMedia } from "./girls";
import VideoEl from "./video";

type GirlProps = {
    girl: GirlWithMedia;
    user: User | null;
};

const GirlEl: React.FC<GirlProps> = ({ girl, user }) => {
    const t = useTranslations("pages.girl");
    const { currency, convert } = useCurrency();

    const handleParticles = () => {
        const heart = confetti.shapeFromText({ text: "❤️", scalar: 2 });

        const defaults = {
            spread: 360,
            ticks: 60,
            gravity: 0,
            decay: 0.96,
            startVelocity: 20,
            shapes: [heart],
            scalar: 2,
        };

        confetti({
            ...defaults,
            particleCount: 50,
        });
    };

    return (
        <div className="max-w-3xl mx-auto overflow-hidden">
            <div
                className="w-full aspect-[7/2] bg-cover bg-center rounded-xl"
                style={{ backgroundImage: `url('${getImage(girl.cover)}')` }}
            />
            <div className="absolute size-32 md:size-40 border-2 border-base-200 rounded-full overflow-hidden translate-x-1/4 -translate-y-1/2">
                <Image
                    src={girl.avatar}
                    alt={girl.name}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex items-center justify-end mt-2">
                {user?.girls.includes(girl.id) ?
                    <button
                        onClick={handleParticles}
                        className="btn rounded-full btn-secondary"
                    >
                        {t("payed", { name: girl.name })}
                    </button>
                :   <Link
                        href={`/payment/${girl.id}`}
                        className="btn rounded-full btn-secondary"
                    >
                        {t("pay", {
                            price: formatAmountForDisplay(
                                convert(girl.price),
                                currency
                            ),
                        })}
                    </Link>
                }
            </div>
            <div className="flex flex-col mt-6 md:mt-8 space-y-2">
                <div>
                    <Title
                        text={girl.name}
                        className="text-2xl md:text-3xl lg:text-4xl"
                    />
                </div>
                <p className="text-sm md:text-base text-base-content/80">
                    {girl.bio}
                </p>
                <p className="text-sm md:text-base text-base-content/80 font-bold">
                    {girl.tags.map((tag) => `#${tag}`).join(" ")}
                </p>
            </div>
            <div className="w-full overflow-y-auto rounded-xl">
                <div className="gap-4 columns-2 md:columns-3">
                    {girl.medias.map((m) => (
                        <div key={m.id} className="rounded-xl flex flex-col">
                            {m.videos.length > 0 && (
                                <VideoEl
                                    video={m.videos[0] as Video}
                                    description={m.description}
                                    bought
                                />
                            )}
                            {m.videos.length == 0 && (
                                <Image
                                    src={m.images[0]}
                                    alt={m.description}
                                    width={256}
                                    height={256}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GirlEl;
