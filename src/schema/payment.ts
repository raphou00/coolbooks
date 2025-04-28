import * as z from "zod";
import { type TranslationsFunc } from "@/lib/types";
import { maxAmount, minAmount } from "@/config/user";

const paymentSchema = (t: TranslationsFunc) =>
    z.object({
        modelId: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),
        
        amount: z
            .number()
            .max(maxAmount, { message: t("messages.max-amount", { max: maxAmount }) })
            .min(minAmount, { message: t("messages.min-amount", { min: minAmount }) }),

        name: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),

        email: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") })
            .email({ message: t("messages.invalid-email") }),

        paymentMethodId: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),
    });

export type PaymentSchema = z.infer<ReturnType<typeof paymentSchema>>;
export default paymentSchema;
