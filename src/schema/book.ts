import * as z from "zod";
import { type T } from "@/lib/types";
import { maxPromptLength, minPromptLength } from "@/config/char";

const bookSchema = (t: T) =>
    z.object({
        prompt: z
            .string()
            .trim()
            .max(maxPromptLength, {
                message: t("messages.max", { max: maxPromptLength }),
            })
            .min(minPromptLength, {
                message: t("messages.min", { min: minPromptLength }),
            })
            .min(1, { message: t("messages.required") }),
    });

export type BookSchema = z.infer<ReturnType<typeof bookSchema>>;
export default bookSchema;
