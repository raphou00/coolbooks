import { getTranslations } from "next-intl/server";
import type { routing } from "./navigation";

export type ActionsState<T> = {
    success: boolean;
    message?: string;
    errors?: { [K in keyof T]?: string[] | undefined };
    redirect?: string;
};

const _getT = async () => await getTranslations({ locale: "en" });

export type T = Awaited<ReturnType<typeof _getT>>;

export type Locale = (typeof routing.locales)[number];
