import * as z from "zod";
import { type T } from "@/lib/types";
import { maxPasswordLength, minPasswordLength } from "@/config/char";

const createPasswordSchema = (t: T) =>
    z
        .object({
            confirmPassword: z
                .string()
                .trim()
                .min(1, { message: t("messages.required") }),

            newPassword: z
                .string()
                .trim()
                .max(maxPasswordLength, {
                    message: t("messages.max", { max: maxPasswordLength }),
                })
                .min(minPasswordLength, {
                    message: t("messages.min", { min: minPasswordLength }),
                })
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

export type CreatePasswordSchema = z.infer<
    ReturnType<typeof createPasswordSchema>
>;
export default createPasswordSchema;
