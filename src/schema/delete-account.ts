import * as z from "zod";
import { type T } from "@/lib/types";

const deleteAccountSchema = (t: T) =>
    z.object({
        email: z
            .string()
            .trim()
            .min(1, { message: t("messages.required") }),
    });

export type DeleteAccountSchema = z.infer<
    ReturnType<typeof deleteAccountSchema>
>;
export default deleteAccountSchema;
