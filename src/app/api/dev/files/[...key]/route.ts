import path from "node:path";
import { isLocal, readLocalFile } from "@/lib/local";
import { notFound } from "@/lib/local/page";

const TYPES: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
};

/** Local mode: serves what S3/CloudFront would serve. */
export const GET = async (
    _: Request,
    ctx: { params: Promise<{ key: string[] }> }
) => {
    if (!isLocal) return notFound();
    const { key } = await ctx.params;
    const name = key.join("/");
    try {
        const body = await readLocalFile(name);
        return new Response(new Uint8Array(body), {
            headers: {
                "content-type":
                    TYPES[path.extname(name).toLowerCase()] ??
                    "application/octet-stream",
                "cache-control": "no-store",
            },
        });
    } catch {
        return notFound();
    }
};
