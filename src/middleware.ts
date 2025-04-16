"use server";

import { NextResponse, type NextRequest } from "next/server";
import { verifyRequestOrigin } from "lucia";
import createMiddleware from "next-intl/middleware";
import { defaultLocale, localePrefix, locales } from "@/lib/navigation";
import env from "./lib/env";
import { ratelimitBase } from "./lib/rate-limiter";

const intlMiddleware = createMiddleware({
    defaultLocale,
    locales,
    localePrefix,
});


export const middleware = async (req: NextRequest) => {
    const { pathname } = req.nextUrl;
    const identifier = req.ip || req.headers.get("x-forwarded-for");

    if (!identifier) {
        return NextResponse.redirect(new URL("/error?error=403", req.url));
    }

    const { success } = await ratelimitBase.limit(identifier);
    if (!success) {
        return NextResponse.redirect(new URL("/error?error=429", req.url));
    }

    if (pathname.startsWith("/api") && req.method !== "GET") {
        const originHeader = req.headers.get("Origin");
        const hostHeader =
            req.headers.get("Host") || req.headers.get("X-Forwarded-Host");
        
        if (
            !originHeader ||
            !hostHeader ||
            !verifyRequestOrigin(originHeader, [hostHeader])
        ) {
            return NextResponse.redirect(new URL("/error?error=403", req.url));
        }

        return NextResponse.next();
    } else if (pathname.startsWith("/api")) {
        return NextResponse.next();
    }
    
    const res = intlMiddleware(req);

    if (req.method === "GET") {
        const token = req.cookies.get("session")?.value ?? null;
        if (token !== null) {
            res.cookies.set("session", token, {
                path: "/",
                maxAge: 60 * 60 * 24 * 30,
                sameSite: "lax",
                httpOnly: true,
                secure: env.NODE_ENV === "production",
            });
        }
    }

    return res;
};

export const config = {
    matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
