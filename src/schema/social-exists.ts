import * as z from "zod";
import db from "@/lib/db";
import { type T } from "@/lib/types";

const socialExistsSchema = (t: T) =>
    z.object({
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

        name: z.string().min(1, { message: t("messages.required") }),
        googleId: z.string().optional(),
    });

export type SocialExistsSchema = z.infer<ReturnType<typeof socialExistsSchema>>;
export default socialExistsSchema;
