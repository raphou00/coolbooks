import { type NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import db from "@/lib/db";
import env from "@/lib/env";
import { putObject } from "@/lib/file";
import { checkRateLimit, ratelimitAudio } from "@/lib/rate-limiter";
import { mockAI } from "@/lib/local";

/** 1 s of 8 kHz mono silence as a WAV file. */
const silentWav = () => {
    const samples = 8000;
    const b = Buffer.alloc(44 + samples);
    b.write("RIFF", 0);
    b.writeUInt32LE(36 + samples, 4);
    b.write("WAVEfmt ", 8);
    b.writeUInt32LE(16, 16);
    b.writeUInt16LE(1, 20);
    b.writeUInt16LE(1, 22);
    b.writeUInt32LE(8000, 24);
    b.writeUInt32LE(8000, 28);
    b.writeUInt16LE(1, 32);
    b.writeUInt16LE(8, 34);
    b.write("data", 36);
    b.writeUInt32LE(samples, 40);
    b.fill(128, 44);
    return b;
};

export const maxDuration = 60;

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY || "sk-local" });

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
        let buffer: Buffer;
        let key = `${bookId}/audio/${page.id}.mp3`;
        if (mockAI && !env.OPENAI_API_KEY) {
            // Local mock mode: one second of silence instead of a TTS call.
            buffer = silentWav();
            key = `${bookId}/audio/${page.id}.wav`;
        } else {
            const speech = await openai.audio.speech.create({
                model: TTS_MODEL,
                voice: TTS_VOICE,
                input: page.text,
                instructions: TTS_INSTRUCTIONS,
                response_format: "mp3",
            });
            buffer = Buffer.from(await speech.arrayBuffer());
        }
        await putObject(
            buffer,
            key,
            key.endsWith(".wav") ? "audio/wav" : "audio/mpeg"
        );
        await db.books.setPageAudio(bookId, page.id, key);

        return NextResponse.json({ url: `${env.CLOUDFRONT_URL}/${key}` });
    } catch (err) {
        console.error("Read-aloud failed:", err);
        return NextResponse.json({ error: "Audio failed" }, { status: 500 });
    }
};
