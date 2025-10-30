import { useTranslations } from "next-intl";
import Image from "next/image";
import Title from "./title";

export const NoSessionResults: React.FC = () => {
    const t = useTranslations("common");
    return (
        <div className="text-center my-12">
            <Image
                src="/images/book-sad.svg"
                width={400}
                height={400}
                alt="404"
                className="mx-auto h-44"
            />
            <Title
                text={t("no-sessions-results")}
                className="mx-auto w-max my-2"
                underline
            />
        </div>
    );
};
