import env from "@/lib/env";
import OpenAI from "openai";
import { putObject } from "./file";
import { createPrompt } from "@/config/prompt";

type Completion = {
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

type Plan = {
    title: string;
    cover: string;
    pages: {
        text: string;
        image: string;
    }[];
}

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: env.OPENROUTER_KEY,
    // defaultHeaders: {
    //     "HTTP-Referer": "<YOUR_SITE_URL>",
    //     "X-Title": "<YOUR_SITE_NAME>",
    // },
});

export const createImage = async (prompt: string, bookId: string): Promise<string> => {
    const completion = await openai.chat.completions.create({
        model: "google/gemini-2.5-flash-image",
        messages: [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt + ", cartoon style"
                    },
                ]
            }
        ],
    });

    const imageBase64 = (completion as unknown as Completion).choices[0].message.images[0].image_url.url;
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const key = bookId + "/" + crypto.randomUUID() + ".png"
    await putObject(buffer, key);

    return key;
}

export const createPlan = async (prompt: string): Promise<Plan> => {
    const completion = await openai.chat.completions.create({
        model: "anthropic/claude-3-haiku",
        messages: [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": createPrompt(prompt),
                    },
                ]
            }
        ],
    });

    const content = completion.choices[0].message.content;

    if (!content) {
        throw new Error("No content");
    }

    const plan = JSON.parse(content.replaceAll("\n", "").replaceAll("\r", "").replaceAll("\\", ""));

    return plan;
}

export default openai;
