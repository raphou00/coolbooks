import * as z from "zod";
import db from "@/lib/db";
import { type TranslationsFunc } from "@/lib/types";
import { maxPasswordLength, minUsernameLength } from "@/config/user";

const updateProfileSchema = (t: TranslationsFunc, curEmail: string) =>
    z.object({
        name: z
            .string()
            .trim()
            .max(maxPasswordLength, {
                message: t("max", { max: maxPasswordLength }),
            })
            .min(minUsernameLength, {
                message: t("min", { min: minUsernameLength }),
            })
            .min(1, { message: t("required") }),

        email: z
            .string()
            .trim()
            .email({ message: t("invalid-email") })
            .min(1, { message: t("required") })
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
                { message: t("taken-email") }
            ),
    });

export type UpdateProfileSchema = z.infer<
    ReturnType<typeof updateProfileSchema>
>;
export default updateProfileSchema;
