/* eslint-disable @typescript-eslint/no-require-imports */
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    UpdateCommand,
    QueryCommand,
    BatchWriteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { z } = require("zod");
const { OpenAI } = require("openai");
const { zodTextFormat } = require("openai/helpers/zod");

const {
    BUCKET_NAME,
    DATA_TABLE,
    OPENROUTER_API_KEY,
    CALLBACK_SECRET,
    DYNAMODB_ENDPOINT,
} = process.env;
const AWS_REGION = process.env.AWS_REGION || "us-east-1";

const PLANNER_MODEL = "openai/gpt-5.2";
/**
 * Nano Banana 2 at 2K (2048 px ≈ 260 DPI on a 20 cm page, sharp enough to
 * print). Override with IMAGE_MODEL, e.g. "google/gemini-3-pro-image-preview".
 */
const IMAGE_MODEL =
    process.env.IMAGE_MODEL || "google/gemini-3.1-flash-image-preview";
const IMAGE_SIZE = "2K";
/**
 * Estimated USD per call, counted against the monthly AI budget
 * (BUDGET#<yyyy-mm> in the data table; the app stops free previews and
 * redraws once it is spent). Check the prices on OpenRouter now and then.
 */
const COST_USD = {
    plan: 0.02,
    "google/gemini-3.1-flash-image-preview": 0.101,
    "google/gemini-3-pro-image-preview": 0.134,
};
const imageCost = () => COST_USD[IMAGE_MODEL] ?? 0.15;
/** Pages drawn in parallel: enough to be fast, few enough to avoid rate limits. */
const IMAGE_CONCURRENCY = 4;
/** Books bought as a guest are attached to this account (unchanged behaviour). */
const GUEST_USER_ID = "64488f3a-0beb-40cc-882b-c458d0725a7e";

const LANGUAGES = {
    de: "German, using Swiss spelling (always 'ss', never 'ß')",
    fr: "French",
    it: "Italian",
    en: "English",
};

const PAGE_COLORS = [
    "#FFF5F5", "#FFF0F5", "#F0F8FF", "#F5FFFA", "#FFFACD", "#FFF8DC",
    "#F0FFF0", "#F8F8FF", "#FDF5E6", "#E6E6FA", "#F0E68C", "#FFEFD5",
    "#FFE4E1", "#E0FFFF", "#FFF5EE", "#F0FFFF", "#FFFAF0", "#F5F0FF",
];

/* ---------- data table keys (same as src/lib/db/keys.ts) ---------- */

const keys = {
    book: (id) => ({ pk: `BOOK#${id}`, sk: "BOOK" }),
    page: (bookId, pageId) => ({ pk: `BOOK#${bookId}`, sk: `PAGE#${pageId}` }),
    preview: (id) => ({ pk: `PREVIEW#${id}`, sk: "PREVIEW" }),
    order: (id) => ({ pk: `ORDER#${id}`, sk: "ORDER" }),
    userIndex: (userId) => `USER#${userId}`,
    orderStatusIndex: (status) => `ORDERS#${status}`,
    budget: (month) => ({ pk: `BUDGET#${month}`, sk: "BUDGET" }),
};

/* ---------- dependencies (overridable in tests) ---------- */

const deps = {
    ddb: DynamoDBDocumentClient.from(
        new DynamoDBClient(
            DYNAMODB_ENDPOINT ? { endpoint: DYNAMODB_ENDPOINT } : {}
        ),
        { marshallOptions: { removeUndefinedValues: true } }
    ),
    openai: new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        // Placeholder lets the module load in local mock mode without a key.
        apiKey: OPENROUTER_API_KEY || "unset",
        defaultHeaders: {
            "HTTP-Referer": "https://bibliboo.ch",
            "X-Title": "Bibliboo",
        },
    }),
    s3: new S3Client(),
    fetch: (...args) => fetch(...args),
    uuid: () => crypto.randomUUID(),
    /** URL the image model fetches the reference (cover) from. */
    referenceUrl: async (key) => s3Url(key),
    /** Settings that are read from the environment by default. */
    config: { dataTable: DATA_TABLE, callbackSecret: CALLBACK_SECRET },
};

const now = () => new Date().toISOString();

const table = () => deps.config.dataTable;

const getItem = async (Key) =>
    (await deps.ddb.send(new GetCommand({ TableName: table(), Key }))).Item ??
    null;

const putItem = (Item) =>
    deps.ddb.send(new PutCommand({ TableName: table(), Item }));

/** SET the given fields on an item. */
const setFields = (Key, fields, extra = {}) => {
    const names = {};
    const values = {};
    const sets = Object.entries(fields).map(([k, v], i) => {
        names[`#f${i}`] = k;
        values[`:v${i}`] = v;
        return `#f${i} = :v${i}`;
    });
    return deps.ddb.send(
        new UpdateCommand({
            TableName: table(),
            Key,
            UpdateExpression: `SET ${sets.join(", ")}`,
            ExpressionAttributeNames: { ...names, ...(extra.names || {}) },
            ExpressionAttributeValues: { ...values, ...(extra.values || {}) },
            ...(extra.condition ? { ConditionExpression: extra.condition } : {}),
        })
    );
};

/** Update an order, keeping its status index (gsi2) in sync. */
const updateOrder = (orderId, fields, extra) => {
    const ts = now();
    return setFields(
        keys.order(orderId),
        {
            ...fields,
            ...(fields.status ?
                { gsi2pk: keys.orderStatusIndex(fields.status) }
            :   {}),
            gsi2sk: ts,
            updatedAt: ts,
        },
        extra
    );
};

/** Add an AI call's estimated cost to this month's spend. Never fails a book. */
const recordSpend = async (usd) => {
    try {
        await deps.ddb.send(
            new UpdateCommand({
                TableName: table(),
                Key: keys.budget(now().slice(0, 7)),
                UpdateExpression: "ADD usd :c, calls :one",
                ExpressionAttributeValues: { ":c": usd, ":one": 1 },
            })
        );
    } catch (err) {
        console.error("Could not record AI spend", err);
    }
};

/** Delete a book and all its pages (same partition). */
const deleteBook = async (bookId) => {
    const res = await deps.ddb.send(
        new QueryCommand({
            TableName: table(),
            KeyConditionExpression: "pk = :b",
            ExpressionAttributeValues: { ":b": keys.book(bookId).pk },
            ProjectionExpression: "pk, sk",
        })
    );
    const items = res.Items ?? [];
    for (let i = 0; i < items.length; i += 25) {
        await deps.ddb.send(
            new BatchWriteCommand({
                RequestItems: {
                    [table()]: items.slice(i, i + 25).map((Key) => ({
                        DeleteRequest: { Key },
                    })),
                },
            })
        );
    }
};

const s3Url = (key) =>
    `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;

const pickColor = () =>
    PAGE_COLORS[Math.floor(Math.random() * PAGE_COLORS.length)];

/** Run `fn` over `items` with at most `limit` in flight. */
const mapLimit = async (items, limit, fn) => {
    const results = new Array(items.length);
    let next = 0;
    const worker = async () => {
        while (next < items.length) {
            const i = next++;
            results[i] = await fn(items[i], i);
        }
    };
    await Promise.all(
        Array.from({ length: Math.min(limit, items.length) }, worker)
    );
    return results;
};

/* ---------- prompts ---------- */

const planSchema = z.object({
    title: z.string(),
    character: z.string(),
    cover: z.string(),
    pages: z.array(z.object({ text: z.string(), image: z.string() })),
});

const promptPlan = (topic) => {
    const language = LANGUAGES[topic.locale] || LANGUAGES.en;
    return `
Create a personalised children's picture book.

- Story idea: ${topic.prompt}
- Main character: ${topic.childName}
- Gender: ${topic.gender}
- Age: ${topic.age}
- Hair colour: ${topic.hairColor}
- Eye colour: ${topic.eyeColor}
- Skin tone: ${topic.skinTone}
- Art style: ${topic.artStyle}

Requirements:
* "title": short (max 6 words), written in ${language}.
* "pages": exactly 12 pages. Each "text" has 3 to 4 sentences written in ${language}, in a warm, simple style suited to a child aged ${topic.age}.
* "character": ONE fixed visual description of ${topic.childName}, in English: face, hair, eyes, skin, and one specific outfit with colours. It is reused verbatim for every illustration, so be concrete.
* "cover" and each page "image": an English prompt describing only the scene (setting, action, mood, composition). Do not describe the main character's appearance again.
* Keep everything gentle, positive and age-appropriate: no violence, no frightening scenes.
`;
};

const promptImage = ({ character, scene, artStyle, title }) => `
Children's picture book illustration in ${artStyle} style.
Main character (keep exactly the same in every picture): ${character}
Scene: ${scene}
${
    title ?
        `This is the book cover. Include the title "${title}" in large, clear, child-friendly lettering.`
    :   "Use the reference image for the character's look, the colour palette and the art style. Do not draw any text."
}
`;

/* ---------- generation ---------- */

const createPlan = async (topic) => {
    const result = await deps.openai.responses.parse({
        model: PLANNER_MODEL,
        input: [{ role: "developer", content: promptPlan(topic) }],
        text: { format: zodTextFormat(planSchema, "book") },
    });
    await recordSpend(COST_USD.plan);
    const plan = result.output_parsed;
    if (!plan || plan.pages.length === 0) throw new Error("Empty story plan");
    return plan;
};

const putObject = async (body, key, contentType = "image/png") => {
    await deps.s3.send(
        new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: body,
            ContentType: contentType,
        })
    );
};

const createImage = async ({ prompt, key, reference }) => {
    const content = [{ type: "text", text: prompt }];
    if (reference) {
        content.push({ type: "image_url", image_url: { url: reference } });
    }

    const completion = await deps.openai.chat.completions.create({
        model: IMAGE_MODEL,
        messages: [{ role: "user", content }],
        modalities: ["image", "text"],
        image_config: { aspect_ratio: "1:1", image_size: IMAGE_SIZE },
    });
    await recordSpend(imageCost());

    const image = completion.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!image) throw new Error(`No image returned for ${key}`);

    const buffer = Buffer.from(
        image.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
    );
    await putObject(buffer, key);
    return key;
};

/* ---------- modes ---------- */

/** Free cover preview, before payment. Idempotent per preview. */
const runPreview = async ({ previewId }) => {
    const preview = await getItem(keys.preview(previewId));
    if (!preview) throw new Error(`Preview ${previewId} not found`);
    if (preview.cover && preview.title) {
        return { title: preview.title, cover: preview.cover };
    }

    const topic = preview.topic;
    const plan = await createPlan(topic);
    const cover = `previews/${previewId}/${deps.uuid()}.png`;

    await createImage({
        prompt: promptImage({
            character: plan.character,
            scene: plan.cover,
            artStyle: topic.artStyle,
            title: plan.title,
        }),
        key: cover,
    });

    await setFields(keys.preview(previewId), {
        plan,
        title: plan.title,
        cover,
    });

    return { title: plan.title, cover };
};

/** The paid book, built from the approved preview. */
const runBook = async ({ orderId, appUrl }) => {
    const order = await getItem(keys.order(orderId));
    if (!order) throw new Error(`Order ${orderId} not found`);
    if (order.status !== "PAID") return { skipped: order.status };

    // Claim the order: only one worker may move it from PAID to GENERATING.
    try {
        await updateOrder(
            orderId,
            {
                status: "GENERATING",
                attempts: (order.attempts || 0) + 1,
                error: null,
            },
            {
                condition: "#st = :paid",
                names: { "#st": "status" },
                values: { ":paid": "PAID" },
            }
        );
    } catch (err) {
        if (err?.name === "ConditionalCheckFailedException") {
            return { skipped: "claimed" };
        }
        throw err;
    }

    try {
        const preview = await getItem(keys.preview(order.previewId));
        if (!preview?.plan || !preview.cover) {
            throw new Error("Preview incomplete or expired");
        }
        const { topic, plan } = preview;

        // A retry starts from a clean book.
        if (order.bookId) {
            await updateOrder(orderId, { bookId: null });
            await deleteBook(order.bookId);
        }

        const bookId = deps.uuid();
        const userId = order.userId || GUEST_USER_ID;
        const createdAt = now();
        await putItem({
            ...keys.book(bookId),
            type: "Book",
            gsi1pk: keys.userIndex(userId),
            gsi1sk: `BOOK#${createdAt}`,
            id: bookId,
            title: preview.title,
            cover: preview.cover,
            age: topic.age,
            artStyle: topic.artStyle,
            dedication: order.dedication || null,
            generating: true,
            redraws: 0,
            userId,
            orderId,
            // Kept on the book so pages can be redrawn after the preview expires.
            plan,
            createdAt,
            updatedAt: createdAt,
        });
        await updateOrder(orderId, { bookId });

        await mapLimit(plan.pages, IMAGE_CONCURRENCY, async (page, i) => {
            const pageId = deps.uuid();
            const key = `${bookId}/${deps.uuid()}.png`;
            await createImage({
                prompt: promptImage({
                    character: plan.character,
                    scene: page.image,
                    artStyle: topic.artStyle,
                }),
                key,
                reference: await deps.referenceUrl(preview.cover),
            });
            await putItem({
                ...keys.page(bookId, pageId),
                type: "Page",
                id: pageId,
                bookId,
                number: i,
                text: page.text,
                image: key,
                color: pickColor(),
            });
        });

        await setFields(keys.book(bookId), {
            generating: false,
            updatedAt: now(),
        });

        // Hand over to the app: it builds the PDF and emails the family.
        const res = await deps.fetch(appUrl, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-callback-secret": deps.config.callbackSecret,
            },
            body: JSON.stringify({ orderId }),
        });
        if (!res.ok) throw new Error(`Delivery callback failed: ${res.status}`);

        return { bookId };
    } catch (err) {
        await updateOrder(orderId, {
            status: "FAILED",
            error: String(err?.message || err).slice(0, 1000),
        });
        throw err;
    }
};

/** Free redraw of one page with the same character and scene. */
const runRedraw = async ({ bookId, pageId }) => {
    const [book, page] = await Promise.all([
        getItem(keys.book(bookId)),
        getItem(keys.page(bookId, pageId)),
    ]);
    if (!book?.plan || !page) {
        throw new Error(`Page ${pageId} cannot be redrawn`);
    }

    const scene = book.plan.pages[page.number]?.image;
    if (!scene) throw new Error(`No scene for page ${pageId}`);

    const key = `${bookId}/${deps.uuid()}.png`;
    await createImage({
        prompt: promptImage({
            character: book.plan.character,
            scene,
            artStyle: book.artStyle,
        }),
        key,
        reference: await deps.referenceUrl(book.cover),
    });

    await setFields(keys.page(bookId, pageId), { image: key });
    return { image: key };
};

const lambda_handler = async (event) => {
    switch (event.mode) {
        case "preview":
            return runPreview(event);
        case "redraw":
            return runRedraw(event);
        case "book":
            return runBook(event);
        default:
            throw new Error(`Unknown mode: ${event.mode}`);
    }
};

exports.lambda_handler = lambda_handler;
exports.__deps = deps;
exports.__internals = { promptPlan, promptImage, mapLimit, keys, IMAGE_MODEL };
