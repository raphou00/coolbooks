import * as z from "zod";
import db from "@/lib/db";
import { type TranslationsFunc } from "@/lib/types";
import {
    maxPasswordLength,
    maxUsernameLength,
    minPasswordLength,
} from "@/config/user";

const registerSchema = (t: TranslationsFunc) =>
    z.object({
        name: z
            .string()
            .trim()
            .max(maxUsernameLength, {
                message: t("max", { max: maxUsernameLength }),
            })
            .min(1, { message: t("required") }),

        email: z
            .string()
            .trim()
            .email({ message: t("invalid-email") })
            .min(1, { message: t("required") })
            .refine(
                async (email) => {
                    const user = await db.user.findUnique({
                        where: { email },
                    });
                    return !user;
                },
                { message: t("taken-email") }
            ),

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
    });

export type RegisterSchema = z.infer<ReturnType<typeof registerSchema>>;
export default registerSchema;
