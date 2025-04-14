import { useTranslations } from "next-intl";
import { HeartCrack } from "lucide-react";
import Title from "./title";

const NoResults: React.FC = () => {
    const t = useTranslations("common");
    return (
        <div className="text-center my-12">
            <HeartCrack className="text-accent mx-auto h-16 w-auto" />
            <Title
                text={t("no-results")}
                className="mx-auto w-max my-2"
                underline
            />
        </div>
    );
};

export default NoResults;
