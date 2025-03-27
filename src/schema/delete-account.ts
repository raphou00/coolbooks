import * as z from "zod";
import { type TranslationsFunc } from "@/lib/types";

const deleteAccountSchema = (t: TranslationsFunc) =>
    z.object({
        email: z
            .string()
            .trim()
            .min(1, { message: t("required") }),
    });

export type DeleteAccountSchema = z.infer<
    ReturnType<typeof deleteAccountSchema>
>;
export default deleteAccountSchema;
