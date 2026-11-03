import { type NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import db from "@/lib/db";
import env from "@/lib/env";
import { putObject } from "@/lib/file";
import { checkRateLimit, ratelimitAudio } from "@/lib/rate-limiter";

export const maxDuration = 60;

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

/** Text-to-speech model and voice for "Boo reads". */
const TTS_MODEL = "gpt-4o-mini-tts";
const TTS_VOICE = "coral";
const TTS_INSTRUCTIONS =
    "You are reading a bedtime picture book aloud to a young child. Read warmly, slowly and clearly, with gentle expression. Use the language of the text.";

/**
 * Read-aloud audio for one page. Generated on first play, then cached in
 * storage, so each page costs one TTS call at most.
 */
export const GET = async (req: NextRequest) => {
    const bookId = req.nextUrl.searchParams.get("bookId");
    const pageId = req.nextUrl.searchParams.get("pageId");
    if (!bookId || !pageId) {
        return NextResponse.json({ error: "Missing page" }, { status: 400 });
    }

    const page = await db.books.getPage(bookId, pageId);
    if (!page?.text) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (page.audio) {
        return NextResponse.json({
            url: `${env.CLOUDFRONT_URL}/${page.audio}`,
        });
    }

    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { allowed } = await checkRateLimit(`audio:${ip}`, ratelimitAudio);
    if (!allowed) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }

    try {
        const speech = await openai.audio.speech.create({
            model: TTS_MODEL,
            voice: TTS_VOICE,
            input: page.text,
            instructions: TTS_INSTRUCTIONS,
            response_format: "mp3",
        });
        const buffer = Buffer.from(await speech.arrayBuffer());
        const key = `${bookId}/audio/${page.id}.mp3`;
        await putObject(buffer, key, "audio/mpeg");
        await db.books.setPageAudio(bookId, page.id, key);

        return NextResponse.json({ url: `${env.CLOUDFRONT_URL}/${key}` });
    } catch (err) {
        console.error("Read-aloud failed:", err);
        return NextResponse.json({ error: "Audio failed" }, { status: 500 });
    }
};
