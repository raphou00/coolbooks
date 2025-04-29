import * as z from "zod";
import { type TranslationsFunc } from "@/lib/types";

const paymentSchema = (t: TranslationsFunc) =>
    z.object({
        modelId: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),

        name: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),

        paymentMethodId: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),
    });

export type PaymentSchema = z.infer<ReturnType<typeof paymentSchema>>;
export default paymentSchema;
