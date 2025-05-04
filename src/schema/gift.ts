import * as z from "zod";
import { type TranslationsFunc } from "@/lib/types";
import { maxAmount, minAmount } from "@/config/user";

const giftSchema = (t: TranslationsFunc) =>
    z.object({
        modelId: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),

        amount: z
            .number()
            .max(maxAmount, {
                message: t("messages.max-amount", { max: maxAmount }),
            })
            .min(minAmount, {
                message: t("messages.min-amount", { min: minAmount }),
            }),

        name: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),

        number: z
            .string()
            .trim()
            .regex(/^\d{4}(?: \d{4}){3}$/, {
                message: t("messages.invalid-number"),
            })
            .min(1, { message: t("messages.required") }),

        expiry: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),

        cvc: z
            .string()
            .trim()
            .regex(/^\d{3}$/, { message: t("messages.invalid-cvc") })
            .min(1, { message: t("messages.required") }),
    });

export type GiftSchema = z.infer<ReturnType<typeof giftSchema>>;
export default giftSchema;
