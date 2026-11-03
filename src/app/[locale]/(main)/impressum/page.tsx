import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { legal, legalIsIncomplete } from "@/config/legal";
import Main from "@/components/layout/main";
import Title from "@/components/ui/title";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages.impressum");
    return { title: t("title"), description: t("description") };
};

const Page = async () => {
    const t = await getTranslations("pages.impressum");

    const rows = [
        { label: t("operator"), value: legal.operator },
        {
            label: t("address"),
            value: [legal.street, legal.city, legal.country].join("\n"),
        },
        { label: t("contact"), value: legal.email },
        ...(legal.uid ? [{ label: t("uid"), value: legal.uid }] : []),
        { label: t("responsible"), value: legal.responsible },
    ];

    return (
        <Main>
            <article className="mx-auto max-w-3xl">
                <header className="border-b-2 border-dashed border-hairline pb-8">
                    <Title text={t("title")} className="type-display-lg" />
                </header>

                {legalIsIncomplete && process.env.NODE_ENV !== "production" && (
                    <p className="mt-6 rounded-md border-2 border-dashed border-tomato p-4 font-bold text-tomato">
                        Dev note: fill in src/config/legal.ts before launch.
                    </p>
                )}

                <dl className="mt-8 divide-y-2 divide-dashed divide-hairline">
                    {rows.map((row) => (
                        <div
                            key={row.label}
                            className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-6"
                        >
                            <dt className="type-label text-ink">{row.label}</dt>
                            <dd className="type-body-lg whitespace-pre-line text-body sm:col-span-2">
                                {row.value}
                            </dd>
                        </div>
                    ))}
                </dl>

                <section className="mt-10">
                    <Title
                        as="h2"
                        text={t("disclaimer-title")}
                        className="type-title-lg"
                    />
                    <p className="type-body-lg mt-3 text-body">
                        {t("disclaimer")}
                    </p>
                </section>
            </article>
        </Main>
    );
};

export { generateMetadata };
export default Page;
