import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { generateState, generateCodeVerifier } from "arctic";
import { google } from "@/lib/auth";
import { checkRateLimit, ratelimitPost } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")?.value || "en",
    });
    try {
        const identifier = req.headers.get("x-forwarded-for");

        if (!identifier) {
            return NextResponse.json({
                redirect: new URL("/error?error=403", req.url),
            });
        }

        const { allowed } = await checkRateLimit(identifier, ratelimitPost);
        if (!allowed) {
            return NextResponse.json({
                redirect: new URL("/error?error=429", req.url),
            });
        }

        const state = generateState();
        const codeVerifier = generateCodeVerifier();
        const url = google.createAuthorizationURL(state, codeVerifier, [
            "openid",
            "profile",
            "email",
        ]);

        (await cookies()).set("google_oauth_state", state, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 10,
            sameSite: "lax",
        });

        (await cookies()).set("google_code_verifier", codeVerifier, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 10,
            sameSite: "lax",
        });

        return NextResponse.json({ redirect: url });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
}
