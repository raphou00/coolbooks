import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { generateState, generateCodeVerifier } from "arctic";
import { google } from "@/lib/auth";
import { ratelimitBasePost } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
    try {
        const identifier = req.headers.get("x-forwarded-for");

        if (!identifier) {
            return NextResponse.redirect(new URL("/error?error=403", req.url));
        }

        const { success } = await ratelimitBasePost.limit(identifier);
        if (!success) {
            return NextResponse.redirect(new URL("/error?error=429", req.url));
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

        return NextResponse.json({ url });
    } catch (_) {
        return NextResponse.redirect(new URL("/error?error=500", req.url));
    }
}
