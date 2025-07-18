"use client";

import Main from "@/components/layout/main";
import Title from "@/components/ui/title";
import Link from "next/link";
import { HeartCrack } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
    const t = useTranslations("messages");
    const searchParams = useSearchParams();
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        if (searchParams?.get("error") === "403") {
            setMessage(t("forbidden"));
        } else if (searchParams?.get("error") === "429") {
            setMessage(t("too-many-requests"));
        } else if (searchParams?.get("error") === "400") {
            setMessage(t("bad-request"));
        } else if (searchParams?.get("error") === "500") {
            setMessage(t("server-error"));
        } else {
            setMessage(t("server-error"));
        }
    }, [searchParams, t]);

    return (
        <Main
            className="flex flex-col justify-center items-center w-full gap-2"
            gradientVariant="floatingGradient"
        >
            <div className="flex flex-col items-center gap-2">
                <HeartCrack className="text-accent mx-auto h-16 w-auto" />
                <Title
                    text="Oops !"
                    className="text-4xl mx-auto text-center w-fit"
                    underline
                />
                <p className="text-center text-lg">{message}</p>
                <Link
                    href="/"
                    className="btn btn-sm btn-primary rounded-full mx-auto"
                >
                    {t("home")}
                </Link>
            </div>
        </Main>
    );
};

export default Page;
