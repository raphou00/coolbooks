import * as z from "zod";
import { type T } from "@/lib/types";
import {
    maxPromptLength,
    maxUsernameLength,
    minPromptLength,
    minUsernameLength,
} from "@/config/char";

export const ageOptions = ["2-3", "4-5", "6-7", "8-9", "10-12", "13+"] as const;
export const genderOptions = ["boy", "girl"] as const;
export const hairColorOptions = [
    "black",
    "brown",
    "blonde",
    "red",
    "gray",
] as const;
export const eyeColorOptions = [
    "brown",
    "blue",
    "green",
    "gray",
    "hazel",
] as const;
export const skinToneOptions = [
    "light",
    "medium",
    "dark",
    "olive",
    "brown",
] as const;
export const artStyleOptions = ["cartoon", "comics", "anime"] as const;
export const themesOptions = [
    "hero",
    "adventure",
    "education",
    "friendship",
    "magic",
    "bedtime",
] as const;
export const themesEnum = z.enum(themesOptions);

const bookSchema = (t: T) =>
    z.object({
        childName: z
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
        gender: z.enum(genderOptions, { message: t("messages.required") }),
        hairColor: z.enum(hairColorOptions, {
            message: t("messages.required"),
        }),
        eyeColor: z.enum(eyeColorOptions, { message: t("messages.required") }),
        skinTone: z.enum(skinToneOptions, { message: t("messages.required") }),
        artStyle: z.enum(artStyleOptions, { message: t("messages.required") }),
        themes: z
            .array(themesEnum, {
                message: t("messages.required"),
            })
            .min(1, { message: t("messages.required") }),
        public: z.boolean(),
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
