import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { OpenAI } from "openai";
import db from "@/lib/db";
import env from "@/lib/env";
import { routing } from "@/lib/navigation";
import { checkRateLimit, ratelimitPreview } from "@/lib/rate-limiter";
import { invokeCreator } from "@/lib/orders";
import { mockAI } from "@/lib/local";
import { previewSchema, type PreviewSchema } from "@/schema/book";

/** Writing the story plan and drawing the cover takes ~30–60 s. */
export const maxDuration = 300;

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY || "sk-local" });

const localeOf = (req: NextRequest) => {
    const value = req.cookies.get("NEXT_LOCALE")?.value;
    return routing.locales.includes(value as never) ?
            (value as string)
        :   routing.defaultLocale;
};

export const POST = async (req: NextRequest) => {
    const locale = localeOf(req);
    const t = await getTranslations({ locale });

    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
        if (!ip) {
            return NextResponse.json({
                success: false,
                message: t("messages.forbidden"),
            });
        }

        const { allowed } = await checkRateLimit(
            `preview:${ip}`,
            ratelimitPreview
        );
        if (!allowed) {
            return NextResponse.json({
                success: false,
                message: t("messages.preview-limit"),
            });
        }

        const body = (await req.json()) as PreviewSchema;
        const parsed = previewSchema(t).safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({
                success: false,
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        // Local mock mode has no OpenAI key, so moderation is skipped there.
        const flagged =
            mockAI && !env.OPENAI_API_KEY ?
                false
            :   (
                    await openai.moderations.create({
                        model: "omni-moderation-latest",
                        input: parsed.data.childName + " " + parsed.data.prompt,
                    })
                ).results[0]?.flagged;
        if (flagged) {
            return NextResponse.json({
                success: false,
                message: t("messages.prompt-inappropriate"),
            });
        }

        const preview = await db.previews.create({
            topic: { ...parsed.data, locale },
            ip,
        });

        const result = await invokeCreator<{ title: string; cover: string }>({
            mode: "preview",
            previewId: preview.id,
        });
        if (!result?.cover) throw new Error("Preview returned no cover");

        return NextResponse.json({
            success: true,
            preview: {
                id: preview.id,
                title: result.title,
                cover: result.cover,
            },
        });
    } catch (err) {
        console.error("Preview failed:", err);
        return NextResponse.json({
            success: false,
            message: t("messages.preview-failed"),
        });
    }
};
