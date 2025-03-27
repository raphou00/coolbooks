import * as z from "zod";
import { type TranslationsFunc } from "@/lib/types";

const verifyEmailSchema = (t: TranslationsFunc) =>
    z.object({
        otp: z
            .string()
            .trim()
            .min(6, { message: t("min", { min: 6 }) })
            .min(1, { message: t("required") }),
    });

export type VerifyEmailSchema = z.infer<ReturnType<typeof verifyEmailSchema>>;
export default verifyEmailSchema;
