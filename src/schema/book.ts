import * as z from "zod";
import { type T } from "@/lib/types";
import {
    maxPromptLength,
    maxUsernameLength,
    minPromptLength,
    minUsernameLength,
} from "@/config/char";

export const ageOptions = ["2-3", "4-7", "8-12", "13+"] as const;
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
export const artStyleOptions = [
    "cartoon",
    "comics",
    "anime",
    "watercolor",
] as const;

export const productOptions = ["PDF", "PRINT"] as const;
export const maxDedicationLength = 160;
export const maxGiftFromLength = 40;

/** Step 1: everything needed to draw the free cover preview. */
export const previewSchema = (t: T) =>
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

/** Step 2: delivery details, after the parent has approved the cover. */
export const checkoutSchema = (t: T) =>
    z
        .object({
            previewId: z.string().uuid(),
            email: z
                .string()
                .trim()
                .email({ message: t("messages.invalid-email") })
                .min(1, { message: t("messages.required") }),
            product: z.enum(productOptions),
            dedication: z
                .string()
                .trim()
                .max(maxDedicationLength, {
                    message: t("messages.max", { max: maxDedicationLength }),
                }),
            isGift: z.boolean(),
            giftTo: z.string().trim(),
            giftFrom: z
                .string()
                .trim()
                .max(maxGiftFromLength, {
                    message: t("messages.max", { max: maxGiftFromLength }),
                }),
        })
        .superRefine((v, ctx) => {
            if (!v.isGift) return;
            if (!z.string().email().safeParse(v.giftTo).success) {
                ctx.addIssue({
                    code: "custom",
                    path: ["giftTo"],
                    message: t("messages.invalid-email"),
                });
            }
            if (!v.giftFrom) {
                ctx.addIssue({
                    code: "custom",
                    path: ["giftFrom"],
                    message: t("messages.required"),
                });
            }
        });

export type PreviewSchema = z.infer<ReturnType<typeof previewSchema>>;
export type CheckoutSchema = z.infer<ReturnType<typeof checkoutSchema>>;
