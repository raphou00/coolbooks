"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyRequestOrigin } from "lucia";
import createMiddleware from "next-intl/middleware";
import { defaultLocale, localePrefix, locales } from "@/lib/navigation";

const intlMiddleware = createMiddleware({
    defaultLocale,
    locales,
    localePrefix,
});

export const middleware = async (req: NextRequest) => {
    const res = intlMiddleware(req);

    if (req.method !== "GET") {
        const originHeader = req.headers.get("Origin");
        const hostHeader = req.headers.get("Host");
        if (
            !originHeader ||
            !hostHeader ||
            !verifyRequestOrigin(originHeader, [hostHeader])
        ) {
            return NextResponse.json(null, { status: 403 });
        }
    }

    return res;
};

export const config = {
    matcher: ["/(de|fr|en|es|ja)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
