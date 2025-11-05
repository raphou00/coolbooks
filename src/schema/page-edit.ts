import * as z from "zod";
import { type T } from "@/lib/types";

const pageEditSchema = (t: T) =>
    z.object({
        id: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),

        text: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),

        color: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),
    });

export type PageEditSchema = z.infer<ReturnType<typeof pageEditSchema>>;
export default pageEditSchema;
