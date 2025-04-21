import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { generateState, generateCodeVerifier } from "arctic";
import { discord } from "@/lib/auth";
import { ratelimitBasePost } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
    try {
        const identifier = req.ip || req.headers.get("x-forwarded-for");

        if (!identifier) {
            return NextResponse.redirect(new URL("/error?error=403", req.url));
        }

        const { success } = await ratelimitBasePost.limit(identifier);
        if (!success) {
            return NextResponse.redirect(new URL("/error?error=429", req.url));
        }

        const state = generateState();
        const codeVerifier = generateCodeVerifier();
        const url = discord.createAuthorizationURL(state, codeVerifier, [
            "openid",
            "email",
            "identify",
        ]);

        cookies().set("discord_oauth_state", state, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 10,
            sameSite: "lax",
        });

        cookies().set("discord_code_verifier", codeVerifier, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 10,
            sameSite: "lax",
        });

        return NextResponse.json({ url });
    } catch (_) {
        return NextResponse.redirect(new URL("/error?error=500", req.url))
    }
}
