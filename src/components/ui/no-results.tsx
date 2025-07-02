import { useTranslations } from "next-intl";
import { HeartCrack } from "lucide-react";
import Title from "./title";

type NoSearchResultsProps = {
    search: string;
};

const NoSearchResults: React.FC<NoSearchResultsProps> = ({ search }) => {
    const t = useTranslations("common");
    search = search.length > 12 ? search.slice(0, 12) + "..." : search;
    return (
        <div className="text-center my-12">
            <HeartCrack className="text-primary mx-auto h-16 w-auto" />
            <Title
                text={t("no-search-results", { search })}
                className="mx-auto w-max my-2"
                underline
            />
        </div>
    );
};

const NoSessionResults: React.FC = () => {
    const t = useTranslations("common");
    return (
        <div className="text-center my-12">
            <HeartCrack className="text-primary mx-auto h-16 w-auto" />
            <Title
                text={t("no-sessions-results")}
                className="mx-auto w-max my-2"
                underline
            />
        </div>
    );
};

export { NoSearchResults, NoSessionResults };
