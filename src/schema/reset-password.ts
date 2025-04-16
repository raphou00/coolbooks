import * as z from "zod";
import { type TranslationsFunc } from "@/lib/types";
import { maxPasswordLength, minPasswordLength } from "@/config/user";

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
                .max(maxPasswordLength, {
                    message: t("max", { max: maxPasswordLength }),
                })
                .min(minPasswordLength, {
                    message: t("min", { min: minPasswordLength }),
                })
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
