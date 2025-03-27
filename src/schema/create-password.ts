import * as z from "zod";
import { type TranslationsFunc } from "@/lib/types";

const createPasswordSchema = (t: TranslationsFunc) =>
    z
        .object({
            confirmPassword: z
                .string()
                .trim()
                .min(1, { message: t("required") }),

            newPassword: z
                .string()
                .trim()
                .max(255, { message: t("min", { min: 255 }) })
                .min(8, { message: t("max", { min: 8 }) })
                .min(1, { message: t("required") }),
        })
        .superRefine(({ newPassword, confirmPassword }, ctx) => {
            if (newPassword !== confirmPassword) {
                ctx.addIssue({
                    code: "custom",
                    message: t("passwords-dont-match"),
                    path: ["confirmPassword"],
                });
            }
        });

export type CreatePasswordSchema = z.infer<
    ReturnType<typeof createPasswordSchema>
>;
export default createPasswordSchema;
