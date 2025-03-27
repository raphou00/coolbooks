import { type useTranslations } from "next-intl";

export type ActionsState<T> = {
    success: boolean;
    message?: string;
    errors?: { [K in keyof T]?: string[] | undefined };
    redirect?: string;
};

export type TranslationsFunc = ReturnType<typeof useTranslations>;
