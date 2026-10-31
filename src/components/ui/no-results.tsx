import { useTranslations } from "next-intl";
import { Inbox } from "lucide-react";

const Empty: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-soft text-muted">
            <Inbox className="size-5" />
        </span>
        <p className="type-label text-ink">{text}</p>
    </div>
);

export const NoSessionResults: React.FC = () => {
    const t = useTranslations("common");
    return <Empty text={t("no-sessions-results")} />;
};

export const NoBooksResults: React.FC = () => {
    const t = useTranslations("common");
    return <Empty text={t("no-books-results")} />;
};
