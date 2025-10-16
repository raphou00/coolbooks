import * as z from "zod";
import { type T } from "@/lib/types";

const bookSchema = (t: T) =>
    z.object({
        prompt: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),
    });

export type BookSchema = z.infer<ReturnType<typeof bookSchema>>;
export default bookSchema;
