import { getTranslations } from "next-intl/server";
import db from "@/lib/db";

/** Approved customer reviews for the homepage. Hidden until there are some. */
const Reviews = async () => {
    const reviews = (await db.reviews.list(true, 6)).filter((r) => r.text);
    if (reviews.length === 0) return null;
    const t = await getTranslations("pages.review");

    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-16">
            <h2 className="type-display-md text-center">{t("section")}</h2>
            <ul className="mt-10 grid gap-6 md:grid-cols-3">
                {reviews.map((r) => (
                    <li
                        key={r.id}
                        className="rounded-3xl border-2 border-ink bg-white p-6"
                    >
                        <p
                            className="text-xl text-ink"
                            aria-label={`${r.rating}/5`}
                        >
                            {"★".repeat(r.rating)}
                            <span className="text-border-strong">
                                {"★".repeat(5 - r.rating)}
                            </span>
                        </p>
                        <p className="type-body mt-3 whitespace-pre-line">
                            {r.text}
                        </p>
                        <p className="type-caption mt-4 text-muted">
                            {t("verified")}
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default Reviews;
