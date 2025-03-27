import * as z from "zod";
import { type TranslationsFunc } from "@/lib/types";

const paymentSchema = (t: TranslationsFunc) =>
    z.object({
        modelId: z
            .string()
            .trim()
            .min(1, { message: t("required") }),

        currency: z
            .string()
            .trim()
            .min(1, { message: t("required") }),

        name: z
            .string()
            .trim()
            .min(1, { message: t("required") }),

        email: z
            .string()
            .trim()
            .min(1, { message: t("required") })
            .email({ message: t("invalid-email") }),

        paymentMethodId: z
            .string()
            .trim()
            .min(1, { message: t("required") }),
    });

export type PaymentSchema = z.infer<ReturnType<typeof paymentSchema>>;
export default paymentSchema;
