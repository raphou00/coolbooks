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
            <HeartCrack className="text-accent mx-auto h-16 w-auto" />
            <Title
                text={t("no-search-results", { search })}
                className="mx-auto w-max my-2"
                underline
            />
        </div>
    );
};

const NoInvoicesResults: React.FC = () => {
    const t = useTranslations("common");
    return (
        <div className="text-center my-12">
            <HeartCrack className="text-accent mx-auto h-16 w-auto" />
            <Title
                text={t("no-invoices-results")}
                className="mx-auto w-max my-2"
                underline
            />
            <p className="my-2 text-sm text-neutral">
                {t("no-invoices-results-description")}
            </p>
        </div>
    );
};

const NoSessionResults: React.FC = () => {
    const t = useTranslations("common");
    return (
        <div className="text-center my-12">
            <HeartCrack className="text-accent mx-auto h-16 w-auto" />
            <Title
                text={t("no-session-results")}
                className="mx-auto w-max my-2"
                underline
            />
        </div>
    );
};

export { NoSearchResults, NoInvoicesResults, NoSessionResults };
