"use client";

import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";

const Error: React.FC = () => {
    const t = useTranslations("messages");

    return (
        <div className="h-full flex flex-col items-center justify-center gap-2">
            <AlertCircle className="size-20 text-primary animate-pulse" />
            <span className="font-bold">{t("server-error")}</span>
        </div>
    );
};

export default Error;
