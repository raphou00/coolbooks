import * as z from "zod";
import { type TranslationsFunc } from "@/lib/types";

const forgotPasswordSchema = (t: TranslationsFunc) =>
    z.object({
        email: z
            .string()
            .trim()
            .min(1, { message: t("required") })
            .email({ message: t("invalid-email") }),
    });

export type ForgotPasswordSchema = z.infer<
    ReturnType<typeof forgotPasswordSchema>
>;
export default forgotPasswordSchema;
