import * as z from "zod";
import { type T } from "@/lib/types";

const updatePasswordSchema = (t: T) =>
    z
        .object({
            currentPassword: z
                .string()
                .trim()
                .min(1, { message: t("messages.required") }),

            confirmPassword: z
                .string()
                .trim()
                .min(1, { message: t("messages.required") }),

            newPassword: z
                .string()
                .trim()
                .max(255, { message: t("messages.max", { max: 255 }) })
                .min(8, { message: t("messages.min", { min: 8 }) })
                .min(1, { message: t("messages.required") }),
        })
        .superRefine(({ newPassword, confirmPassword }, ctx) => {
            if (newPassword !== confirmPassword) {
                ctx.addIssue({
                    code: "custom",
                    message: t("messages.passwords-dont-match"),
                    path: ["confirmPassword"],
                });
            }
        });

export type UpdatePasswordSchema = z.infer<
    ReturnType<typeof updatePasswordSchema>
>;
export default updatePasswordSchema;
