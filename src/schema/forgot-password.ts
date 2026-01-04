import * as z from "zod";
import { type T } from "@/lib/types";

const forgotPasswordSchema = (t: T) =>
    z.object({
        email: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") })
            .email({ message: t("messages.invalid-email") }),
    });

export type ForgotPasswordSchema = z.infer<
    ReturnType<typeof forgotPasswordSchema>
>;
export default forgotPasswordSchema;
