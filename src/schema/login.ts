import * as z from "zod";
import { type T } from "@/lib/types";

const loginSchema = (t: T) =>
    z.object({
        email: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),

        password: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),
    });

export type LoginSchema = z.infer<ReturnType<typeof loginSchema>>;
export default loginSchema;
