import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import env from "@/lib/env";
import { domain } from "@/config/seo";
import Main from "@/components/layout/main";
import Title from "@/components/ui/title";
import DateEl from "@/components/ui/date";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("refund.title"),
        description: t("refund.description"),
    };
};

const Page = async () => {
    const t = await getTranslations("pages.refund");
    return (
        <Main className="max-w-3xl mx-auto pt-4">
            <Title
                text={t("title")}
                className="text-4xl mx-auto w-fit text-center"
            />
            <p className="mt-4 text-center">
                {t("date")} <DateEl date={new Date("2026-01-05")} />
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
                    email: env.SENDER_EMAIL,
                    website: domain,
                })}
            </div>
        </Main>
    );
};

export { generateMetadata };
export default Page;
