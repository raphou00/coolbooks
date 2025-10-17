import * as z from "zod";
import db from "@/lib/db";
import { type T } from "@/lib/types";
import { maxPasswordLength, minUsernameLength } from "@/config/char";

const updateProfileSchema = (t: T, curEmail: string) =>
    z.object({
        name: z
            .string()
            .trim()
            .max(maxPasswordLength, {
                message: t("messages.max", { max: maxPasswordLength }),
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
                    if (email === curEmail) {
                        return true;
                    }
                    const user = await db.user.findUnique({
                        where: { email },
                    });
                    return !user;
                },
                { message: t("messages.taken-email") }
            ),
    });

export type UpdateProfileSchema = z.infer<
    ReturnType<typeof updateProfileSchema>
>;
export default updateProfileSchema;
