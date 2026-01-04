import Image from "next/image";
import { useTranslations } from "next-intl";
import Title from "./title";

export const NoSessionResults: React.FC = () => {
    const t = useTranslations("common");
    return (
        <div className="text-center my-12">
            <Image
                src="/images/error.svg"
                width={400}
                height={400}
                alt="404"
                className="mx-auto h-44"
            />
            <Title
                text={t("no-sessions-results")}
                className="mx-auto w-max my-2"
            />
        </div>
    );
};

export const NoBooksResults: React.FC = () => {
    const t = useTranslations("common");
    return (
        <div className="text-center my-12">
            <Image
                src="/images/error.svg"
                width={400}
                height={400}
                alt="404"
                className="mx-auto h-44"
            />
            <Title
                text={t("no-books-results")}
                className="mx-auto w-max my-2"
            />
        </div>
    );
};
