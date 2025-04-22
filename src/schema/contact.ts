import * as z from "zod";
import { type TranslationsFunc } from "@/lib/types";

const contactSchema = (t: TranslationsFunc) =>
    z.object({
        name: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),

        email: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),

        subject: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),

        message: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),
    });

export type ContactSchema = z.infer<ReturnType<typeof contactSchema>>;
export default contactSchema;
