"use client";

import { useLocale } from "next-intl";

type DateProps = {
    date: string | number | Date;
};

/** Long date in the visitor's language, Swiss conventions (e.g. "31. Oktober 2026"). */
const DateEl: React.FC<DateProps> = ({ date }) => {
    const locale = useLocale();
    const d = new globalThis.Date(date);
    const text = new Intl.DateTimeFormat(`${locale}-CH`, {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(d);

    return <time dateTime={d.toISOString()}>{text}</time>;
};

export default DateEl;
