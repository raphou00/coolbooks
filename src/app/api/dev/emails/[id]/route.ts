import { isLocal, readLocalEmail } from "@/lib/local";
import { notFound } from "@/lib/local/page";

export const GET = async (
    _: Request,
    ctx: { params: Promise<{ id: string }> }
) => {
    if (!isLocal) return notFound();
    const { id } = await ctx.params;
    try {
        return new Response(await readLocalEmail(id), {
            headers: { "content-type": "text/html; charset=utf-8" },
        });
    } catch {
        return notFound();
    }
};
