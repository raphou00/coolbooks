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
        <Main>
            <article className="mx-auto max-w-3xl">
                <header className="border-b border-hairline pb-8">
                    <Title text={t("title")} className="type-display-lg" />
                    <p className="type-body mt-4 text-muted">
                        {t("date")} <DateEl date={new Date("2026-01-05")} />
                    </p>
                </header>

                <div className="type-body-lg mt-8 text-body leading-[1.65]!">
                    {t.rich("content", {
                        return: () => <br />,
                        title: (chunk) => (
                            <Title
                                as="h2"
                                text={chunk!.toString()}
                                className="type-title-lg mt-6 mb-1"
                            />
                        ),
                        email: env.SENDER_EMAIL,
                        website: domain,
                    })}
                </div>
            </article>
        </Main>
    );
};

export { generateMetadata };
export default Page;
