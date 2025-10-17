/* eslint-disable @typescript-eslint/no-explicit-any */

import { generateObject } from "ai";
import { OpenAI } from "openai";
import { putObject } from "./file";
import { promptPlan, promptImage } from "@/config/prompt";
import { z } from "zod";
import env from "./env";

type ImageCompletion = {
    choices: {
        message: {
            images: {
                image_url: {
                    url: string;
                };
            }[];
        };
    }[];
};

const PLANNER_MODEL = "anthropic/claude-3-haiku";
const IMAGE_MODEL = "google/gemini-2.5-flash-image-preview";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: env.OPENROUTER_KEY,
});

export const createPlan = async (topic: string): Promise<any> => {
    const result = await generateObject<any>({
        model: PLANNER_MODEL,
        prompt: promptPlan(topic),
        maxRetries: 3,
        schema: z.object({
            title: z.string(),
            cover: z.string(),
            pages: z.array(
                z.object({
                    text: z.string(),
                    image: z.string(),
                })
            ),
        }),
    });

    return result.object;
};

export const createImage = async (
    topic: string,
    key: string,
    base?: string | null,
    title?: string
): Promise<string> => {
    const content: any = [
        {
            type: "text",
            text: promptImage(topic, title),
        },
    ];

    if (base) {
        content.push({
            type: "image_url",
            image_url: {
                url: base,
            },
        });
    }

    const completion = (await openai.chat.completions.create({
        model: IMAGE_MODEL,
        messages: [
            {
                role: "user",
                content: content,
            },
        ],
    })) as unknown as ImageCompletion;

    const image = completion.choices[0].message.images[0].image_url.url;

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    await putObject(buffer, key);

    return key;
};
