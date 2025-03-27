import * as z from "zod";
import { type TranslationsFunc } from "@/lib/types";

const loginSchema = (t: TranslationsFunc) =>
    z.object({
        email: z
            .string()
            .trim()
            .min(1, { message: t("required") }),

        password: z
            .string()
            .trim()
            .min(1, { message: t("required") }),
    });

export type LoginSchema = z.infer<ReturnType<typeof loginSchema>>;
export default loginSchema;
