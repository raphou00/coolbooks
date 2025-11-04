import * as z from "zod";
import { type T } from "@/lib/types";
import { maxUsernameLength, minUsernameLength } from "@/config/char";
import { ageOptions, themesEnum } from "./book";

const bookEditSchema = (t: T) =>
    z.object({
        title: z
            .string()
            .trim()
            .max(maxUsernameLength, {
                message: t("messages.max", { max: maxUsernameLength }),
            })
            .min(minUsernameLength, {
                message: t("messages.min", { min: minUsernameLength }),
            })
            .min(1, { message: t("messages.required") }),
        age: z.enum(ageOptions, { message: t("messages.required") }),
        themes: z
            .array(themesEnum, {
                message: t("messages.required"),
            })
            .min(1, { message: t("messages.required") }),
        public: z.boolean().default(false),
    });

export type BookEditSchema = z.infer<ReturnType<typeof bookEditSchema>>;
export default bookEditSchema;
