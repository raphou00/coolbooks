import * as z from "zod";
import { type TranslationsFunc } from "@/lib/types";

const updatePasswordSchema = (t: TranslationsFunc) =>
    z
        .object({
            currentPassword: z
                .string()
                .trim()
                .min(1, { message: t("required") }),

            confirmPassword: z
                .string()
                .trim()
                .min(1, { message: t("required") }),

            newPassword: z
                .string()
                .trim()
                .max(255, { message: t("max", { max: 255 }) })
                .min(8, { message: t("min", { min: 8 }) })
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

export type UpdatePasswordSchema = z.infer<
    ReturnType<typeof updatePasswordSchema>
>;
export default updatePasswordSchema;
