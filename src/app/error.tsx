"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Title from "@/components/ui/title";

const RootError: React.FC = () => {
    const t = useTranslations("common");
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center gap-y-4">
            <Image
                src="/images/error.svg"
                width={475}
                height={400}
                alt="500"
                className="h-44 w-auto animate-bounce"
            />
            <Title text={t("error")} className="w-max" />
            <Link href="/" className="btn btn-primary">
                {t("back-home")}
            </Link>
        </div>
    );
};

export default RootError;
