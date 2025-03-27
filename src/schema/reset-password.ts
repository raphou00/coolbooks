import * as z from "zod";
import { type TranslationsFunc } from "@/lib/types";

const resetPasswordSchema = (t: TranslationsFunc) =>
    z
        .object({
            code: z
                .string()
                .trim()
                .min(1, { message: t("required") }),

            password: z
                .string()
                .trim()
                .max(255, { message: t("min", { min: 255 }) })
                .min(8, { message: t("max", { min: 8 }) })
                .min(1, { message: t("required") }),

            confirmPassword: z
                .string()
                .trim()
                .min(1, { message: t("required") }),
        })
        .superRefine(({ confirmPassword, password }, ctx) => {
            if (confirmPassword !== password) {
                ctx.addIssue({
                    code: "custom",
                    message: t("passwords-dont-match"),
                    path: ["confirmPassword"],
                });
            }
        });

export type ResetPasswordSchema = z.infer<
    ReturnType<typeof resetPasswordSchema>
>;
export default resetPasswordSchema;
