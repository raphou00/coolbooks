import * as z from "zod";
import db from "@/lib/db";
import { type TranslationsFunc } from "@/lib/types";

const registerSchema = (t: TranslationsFunc) =>
    z.object({
        name: z
            .string()
            .trim()
            .max(255, { message: t("max", { max: 255 }) })
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
            .max(255, { message: t("max", { max: 255 }) })
            .min(8, { message: t("min", { min: 8 }) })
            .min(1, { message: t("required") }),
    });

export type RegisterSchema = z.infer<ReturnType<typeof registerSchema>>;
export default registerSchema;
