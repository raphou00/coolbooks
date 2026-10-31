"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Status from "@/components/ui/status";

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
        <Status
            code={searchParams?.get("error") || "500"}
            title="Oops!"
            description={displayError()}
            action={t("home")}
        />
    );
};

export default Page;
