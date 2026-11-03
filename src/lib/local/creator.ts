import { createRequire } from "node:module";
import path from "node:path";
import { OpenAI } from "openai";
import env from "@/lib/env";
import { ddb } from "@/lib/dynamo";
import { mockAI, readLocalFile, writeLocalFile } from "@/lib/local";
import { mockOpenAI } from "@/lib/local/mock-ai";

type Creator = {
    lambda_handler: (event: unknown) => Promise<unknown>;
    __deps: Record<string, unknown>;
};

let creator: Creator | null = null;

/**
 * Load book-creator/index.js (the Lambda's code) into this process, wired
 * to DynamoDB Local, the local file store and the mock or real AI.
 */
const load = (): Creator => {
    if (creator) return creator;

    // Loaded at runtime from disk so the bundler leaves the Lambda code alone.
    const req = createRequire(path.join(process.cwd(), "package.json"));
    const mod = req(
        path.join(process.cwd(), "book-creator", "index.js")
    ) as Creator;

    Object.assign(mod.__deps, {
        ddb,
        openai:
            mockAI ? mockOpenAI : (
                new OpenAI({
                    baseURL: "https://openrouter.ai/api/v1",
                    apiKey: env.OPENROUTER_API_KEY,
                })
            ),
        s3: {
            send: async (cmd: { input: { Key: string; Body: Buffer } }) =>
                writeLocalFile(cmd.input.Key, cmd.input.Body),
        },
        // The image model can't reach localhost, so send the cover inline.
        referenceUrl: async (key: string) =>
            `data:image/png;base64,${(await readLocalFile(key)).toString("base64")}`,
        config: {
            dataTable: env.DATA_DYNAMODB_TABLE,
            callbackSecret: env.LAMBDA_CALLBACK_SECRET,
        },
    });

    creator = mod;
    return mod;
};

/** Same contract as invoking the Lambda: "book" runs in the background. */
export const invokeLocalCreator = async (
    event: { mode: string } & Record<string, unknown>
) => {
    const { lambda_handler } = load();
    if (event.mode === "book") {
        lambda_handler(event).catch((err) =>
            console.error("[local creator] book failed:", err)
        );
        return null;
    }
    return lambda_handler(event);
};
