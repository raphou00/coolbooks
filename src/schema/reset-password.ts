import * as z from "zod";
import { type T } from "@/lib/types";
import { maxPasswordLength, minPasswordLength } from "@/config/char";

const resetPasswordSchema = (t: T) =>
    z
        .object({
            code: z
                .string()
                .trim()
                .min(1, { message: t("messages.required") }),

            password: z
                .string()
                .trim()
                .max(maxPasswordLength, {
                    message: t("messages.max", { max: maxPasswordLength }),
                })
                .min(minPasswordLength, {
                    message: t("messages.min", { min: minPasswordLength }),
                })
                .min(1, { message: t("messages.required") }),

            confirmPassword: z
                .string()
                .trim()
                .min(1, { message: t("messages.required") }),
        })
        .superRefine(({ confirmPassword, password }, ctx) => {
            if (confirmPassword !== password) {
                ctx.addIssue({
                    code: "custom",
                    message: t("messages.passwords-dont-match"),
                    path: ["confirmPassword"],
                });
            }
        });

export type ResetPasswordSchema = z.infer<
    ReturnType<typeof resetPasswordSchema>
>;
export default resetPasswordSchema;
