"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Main from "@/components/layout/main";
import Title from "@/components/ui/title";

const Page = () => {
    const t = useTranslations("messages");
    const searchParams = useSearchParams();

    const displayError = () => {
        if (searchParams?.get("error") === "403") {
            return t("forbidden");
        } else if (searchParams?.get("error") === "429") {
            return t("too-many-requests");
        } else if (searchParams?.get("error") === "400") {
            return t("bad-request");
        } else if (searchParams?.get("error") === "500") {
            return t("server-error");
        } else {
            return t("server-error");
        }
    };

    return (
        <Main className="flex flex-col items-center justify-center gap-y-4 -mt-12">
            <Image
                src="/images/error.svg"
                width={475}
                height={400}
                alt="500"
                className="h-44 w-auto animate-bounce"
            />
            <Title text="Oops !" className="w-max" />
            <p className="text-center text-lg">{displayError()}</p>
            <Link href="/" className="btn btn-primary">
                {t("home")}
            </Link>
        </Main>
    );
};

export default Page;
