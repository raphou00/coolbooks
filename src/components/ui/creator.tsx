"use client";

import type { Creator } from "@prisma/client";
import type { User } from "lucia";
import { formatAmountForDisplay } from "@/lib/utils";
import { useCurrency } from "@/hook/use-currency";
import Title from "@/components/ui/title";
import ChipTabs from "@/components/ui/chips-tabs";
import Image from "@/components/ui/image";
import { useTranslations } from "next-intl";
import Link from "next/link";

type CreatorProps = {
    creator: Creator;
    user: User | null;
};

const CreatorEl: React.FC<CreatorProps> = ({ creator, user }) => {
    const t = useTranslations("pages.creators");
    const { currency, convert } = useCurrency();

    return (
        <div className="max-w-3xl mx-auto overflow-hidden">
            <div
                className="w-full aspect-[7/2] bg-cover bg-center rounded-xl"
                style={{ backgroundImage: `url('${creator.cover}')` }}
            />
            <div className="absolute size-32 md:size-40 border-2 border-base-200 rounded-full overflow-hidden translate-x-1/4 -translate-y-1/2">
                <Image
                    src={creator.avatar}
                    alt={creator.name}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex items-center justify-end mt-2">
                {user?.creators.includes(creator.id) && (
                    <button className="btn rounded-full btn-primary">
                        {creator.name}
                    </button>
                )}
                <Link
                    href={`/payment/${creator.id}`}
                    className="btn rounded-full btn-secondary"
                >
                    {t("pay", {
                        price: formatAmountForDisplay(
                            convert(creator.price),
                            currency
                        ),
                    })}
                </Link>
            </div>
            <div className="flex flex-col mt-6 md:mt-8">
                <div>
                    <Title
                        text={creator.name}
                        className="text-2xl md:text-3xl lg:text-4xl"
                    />
                </div>
                <p className="text-sm md:text-base text-base-content/80">
                    {creator.description}
                </p>
            </div>
            <div className="flex items-center mt-4">
                <ChipTabs />
            </div>
        </div>
    );
};

export default CreatorEl;
