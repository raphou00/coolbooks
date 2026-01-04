import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Main from "@/components/layout/main";
import Title from "@/components/ui/title";
import DateEl from "@/components/ui/date";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("privacy.title"),
        description: t("privacy.description"),
    };
};

const Page = async () => {
    const t = await getTranslations("pages.privacy");
    return (
        <Main className="max-w-3xl mx-auto pt-4">
            <Title
                text={t("title")}
                className="text-4xl mx-auto w-fit text-center"
            />
            <p className="mt-4 text-center">
                {t("date")} <DateEl date={new Date("2025-06-03")} />
            </p>

            <div className="mt-6">
                {t.rich("content", {
                    return: () => <br />,
                    title: (chunk) => (
                        <Title
                            text={chunk!.toString()}
                            className="text-lg mt-4"
                        />
                    ),
                })}
            </div>
        </Main>
    );
};

export { generateMetadata };
export default Page;
