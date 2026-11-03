import { useTranslations } from "next-intl";
import Status from "@/components/ui/status";

const RootNotFound: React.FC = () => {
    const t = useTranslations("common");
    return (
        <Status
            fullscreen
            code="404"
            title={t("not-found")}
            action={t("back-home")}
        />
    );
};

export const dynamic = "force-dynamic";
export default RootNotFound;
