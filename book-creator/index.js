/* eslint-disable @typescript-eslint/no-require-imports */
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Pool } = require("pg");
const { z } = require("zod");
const { OpenAI } = require("openai");
const { zodTextFormat } = require("openai/helpers/zod");

const { BUCKET_NAME, DATABASE_URL, OPENROUTER_API_KEY } = process.env;

const PLANNER_MODEL = "openai/gpt-5.2";
const IMAGE_MODEL = "google/gemini-2.5-flash-image-preview";

const pool = new Pool({
    connectionString: DATABASE_URL,
    max: 1,
})

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "https://coolbooks.app",
        "X-Title": "Cool Books",
    }
});

const s3 = new S3Client();

const colors = ["#FFF5F5", "#FFF0F5", "#F0F8FF", "#F5FFFA",
    "#FFFACD", "#FFF8DC", "#F0FFF0", "#F8F8FF", "#FDF5E6",
    "#E6E6FA", "#F0E68C", "#FFEFD5", "#FFE4E1", "#E0FFFF",
    "#FFF5EE", "#F0FFFF", "#FFFAF0", "#F5F0FF", "#FFF0F0",
    "#F0FFF8", "#FFFFF0", "#F8FFF8", "#FFF8F0", "#FAF0E6"
];

const randomHex = () =>
    colors[Math.floor(Math.random() * colors.length)];

const getS3 = (key) => {
    return `https://${BUCKET_NAME}.s3.us-east-1.amazonaws.com/${key}`;
};

const promptPlan = (topic) => `
Create a kid book using the following details:

-  Prompt/Topic: ${topic.prompt}
-  Main Character: ${topic.childName}
-  Gender: ${topic.gender}
-  Age: ${topic.age}
-  Hair Color: ${topic.hairColor}
-  Eye Color: ${topic.eyeColor}
-  Skin Color: ${topic.skinTone}
-  Art Style for image prompt: ${topic.artStyle}
-  Theme: ${topic.themes}

Requirements:
* The title must be short and concise.
* Each page's text should contain 3~4 sentences
* Describe the cover and each page's image in a detailed prompt, matching the specified art style, character appearance, theme.
* Be very precise with the image prompts to ensure the visuals match the description.
* Write the text in a kid-friendly style corresponding to the target age group.
* Everything MUST be in English.
* The cover prompt MUST include the description of the kid.

Output:
1. Title
2. Page-by-page story text (12 pages)
3. For each page (including the cover), a detailed image prompt reflecting all the above details.
4. Output MUST be in JSON format.
`;

const promptImage = (topic, artStyle, title) => `
generate an image of "${topic}, ${artStyle} style",
use the reference image as a base for character, background and style design
${title ? `include the title: ${title}` : "no text should be displayed on the image"}
`;

const putObject = async (file, key) => {
    const body =
        file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: body,
    };

    try {
        const res = await s3.send(new PutObjectCommand(params));

        return res;
    } catch (err) {
        console.error("Error", err);
    }
};

const createPlan = async (topic) => {
    const result = await openai.responses.parse({
        model: PLANNER_MODEL,
        input: [{ role: "developer", content: promptPlan(topic) }],
        text: {
            format: zodTextFormat(
                z.object({
                    title: z.string(),
                    cover: z.string(),
                    pages: z.array(
                        z.object({
                            text: z.string(),
                            image: z.string(),
                        })
                    ),
                }),
                "event"
            ),
        },
    });

    return result.output_parsed;
};

const createImage = async (
    topic,
    artStyle,
    key,
    base,
    title
) => {
    // const content = [
    //     {
    //         type: "text",
    //         text: promptImage(topic, artStyle, title),
    //     },
    // ];

    // if (base) {
    //     content.push({
    //         type: "image_url",
    //         image_url: {
    //             url: base,
    //         },
    //     });
    // }

    // const completion = (await openai.chat.completions.create({
    //     model: IMAGE_MODEL,
    //     messages: [
    //         {
    //             role: "user",
    //             content: content,
    //         },
    //     ],
    // }));

    // const image = completion.choices[0].message.images[0].image_url.url;

    // const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    // const buffer = Buffer.from(base64Data, "base64");

    // await putObject(buffer, key);

    return key;
};

const createBook = async (bookData) => {
    const client = await pool.connect();
    try {
        const query = `
            INSERT INTO "Book" (id, title, cover, age, "artStyle", "userId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *
        `;

        const values = [
            bookData.id,
            bookData.title,
            bookData.cover,
            bookData.age,
            bookData.artStyle,
            bookData.userId || "64488f3a-0beb-40cc-882b-c458d0725a7e"
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

const createPage = async (pageData) => {
    const client = await pool.connect();
    try {
        const query = `
            INSERT INTO "Page" ("id", "bookId", color, text, image, number, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *
        `;

        const values = [
            crypto.randomUUID(),
            pageData.bookId,
            pageData.color,
            pageData.text,
            pageData.image,
            pageData.number
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

const updateBookGenerating = async (bookId, generating) => {
    const client = await pool.connect();
    try {
        const query = `
            UPDATE "Book"
            SET generating = $1, "updatedAt" = NOW()
            WHERE id = $2
            RETURNING *
        `;

        const values = [
            generating,
            bookId
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};


const lambda_handler = async (event) => {
    const { appUrl, userId, topic } = event;

    const bookId = crypto.randomUUID();
    const plan = await createPlan(topic);

    const coverKey = bookId + "/" + crypto.randomUUID() + ".png";

    await createBook({
        id: bookId,
        title: plan.title,
        cover: coverKey,
        public: topic.public,
        age: topic.age,
        artStyle: topic.artStyle,
        themes: topic.themes,
        userId: userId,
    });

    await createImage(
        plan.cover,
        topic.artStyle,
        coverKey,
        null,
        plan.title
    );

    const pages = plan.pages.map((page, i) => {
        const key = bookId + "/" + crypto.randomUUID() + ".png";
        return {
            color: randomHex(),
            text: page.text,
            image: key,
            number: i
        };
    });

    const pageJobs = pages.map((page, i) => {
        return createImage(plan.pages[i].image, topic.artStyle, page.image, getS3(coverKey))
            .then(() => createPage({
                bookId,
                color: page.color,
                text: page.text,
                image: page.image,
                number: page.number
            }));
    });

    await Promise.all([...pageJobs]);

    await updateBookGenerating(bookId, false);

    const body = JSON.stringify({
        bookId,
        email: topic.email,
        title: plan.title,
        cover: coverKey,
        pages: pages
    });

    await fetch(appUrl, {
        method: "POST",
        body,
    });

    return {
        statusCode: 201,
        body,
    };
};

exports.lambda_handler = lambda_handler;
