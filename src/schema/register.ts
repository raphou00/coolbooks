import * as z from "zod";
import db from "@/lib/db";
import { type T } from "@/lib/types";
import {
    maxPasswordLength,
    maxUsernameLength,
    minPasswordLength,
    minUsernameLength,
} from "@/config/char";

const registerSchema = async (t: T) =>
    z.object({
        name: z
            .string()
            .trim()
            .max(maxUsernameLength, {
                message: t("messages.max", { max: maxUsernameLength }),
            })
            .min(minUsernameLength, {
                message: t("messages.min", { min: minUsernameLength }),
            })
            .min(1, { message: t("messages.required") }),

        email: z
            .string()
            .trim()
            .email({ message: t("messages.invalid-email") })
            .min(1, { message: t("messages.required") })
            .refine(
                async (email) => {
                    const user = await db.user.findUnique({
                        where: { email },
                    });
                    return !user;
                },
                { message: t("messages.taken-email") }
            ),

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
    });

export type RegisterSchema = z.infer<
    Awaited<ReturnType<typeof registerSchema>>
>;
export default registerSchema;
