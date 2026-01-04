"use server";

import { NextResponse, type NextRequest } from "next/server";
import { verifyRequestOrigin } from "lucia";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/navigation";
import env from "./lib/env";

const intlMiddleware = createMiddleware({
    defaultLocale: routing.defaultLocale,
    locales: routing.locales,
    localePrefix: routing.localePrefix,
});

const allowedPaths = ["/api/stripe/webhook"];

export const proxy = async (req: NextRequest) => {
    const { pathname } = req.nextUrl;

    if (allowedPaths.includes(pathname)) {
        return;
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
            return NextResponse.json({
                message: "unauthorized",
            });
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
