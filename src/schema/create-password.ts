import * as z from "zod";
import { type TranslationsFunc } from "@/lib/types";
import { maxPasswordLength, minPasswordLength } from "@/config/user";

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
                .max(maxPasswordLength, {
                    message: t("max", { max: maxPasswordLength }),
                })
                .min(minPasswordLength, {
                    message: t("min", { min: minPasswordLength }),
                })
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
