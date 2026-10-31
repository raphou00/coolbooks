"use client";

import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";

const Error: React.FC = () => {
    const t = useTranslations("messages");

    return (
        <div className="flex h-full flex-col items-center justify-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-peach text-navy">
                <AlertCircle className="size-5" />
            </span>
            <span className="type-label text-ink">{t("server-error")}</span>
        </div>
    );
};

export default Error;
