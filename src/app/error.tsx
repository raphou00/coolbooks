"use client";

import { useTranslations } from "next-intl";
import Status from "@/components/ui/status";

const RootError: React.FC = () => {
    const t = useTranslations("common");
    return (
        <Status
            fullscreen
            code="Error"
            title={t("error")}
            action={t("back-home")}
        />
    );
};

export default RootError;
