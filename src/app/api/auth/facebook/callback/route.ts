import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { facebook, createSession, getUser } from "@/lib/auth";
import { ObjectParser } from "@pilcrowjs/object-parser";
import type { OAuth2Tokens } from "arctic";
import db from "@/lib/db";
import env from "@/lib/env";

export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        const url = new URL(req.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const storedState =
            (await cookies()).get("facebook_oauth_state")?.value ?? null;

        if (code === null || state === null || storedState === null) {
            return NextResponse.redirect(new URL("/error?error=400", req.url));
        }
        if (state !== storedState) {
            return NextResponse.redirect(new URL("/error?error=400", req.url));
        }

        let tokens: OAuth2Tokens;
        try {
            tokens = await facebook.validateAuthorizationCode(code);
        } catch {
            return NextResponse.redirect(new URL("/error?error=400", req.url));
        }

        const response = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email&access_token=${tokens.accessToken()}`
        );
        const facebookUser = await response.json();

        if (!response.ok) {
            return NextResponse.redirect(new URL("/error?error=400", req.url));
        }

        const userParser = new ObjectParser(facebookUser);

        const facebookId = userParser.getString("id");
        const name = userParser.getString("name");
        const email = userParser.getString("email");

        if (user?.user && !user.user.facebookId) {
            await db.user.update({
                where: {
                    id: user.user.id,
                },
                data: {
                    facebookId,
                },
            });
            return NextResponse.redirect(
                new URL("/account/socials", env.APP_URL)
            );
        }

        const existingUser = await db.user.findFirst({
            where: {
                facebookId,
            },
        });

        if (existingUser) {
            await createSession(existingUser.id);
            return NextResponse.redirect(new URL("/", env.APP_URL));
        }

        const existingEmail = await db.user.findFirst({
            where: {
                email,
            },
        });

        if (existingEmail) {
            return NextResponse.redirect(
                new URL(
                    `/social-exists?name=${name}&facebookId=${facebookId}`,
                    req.url
                )
            );
        }

        const newUser = await db.user.create({
            data: {
                name,
                email,
                facebookId,
            },
        });

        await createSession(newUser.id);

        return NextResponse.redirect(new URL("/", env.APP_URL));
    } catch (e) {
        console.error(e);
        return NextResponse.redirect(new URL("/error?error=500", req.url));
    }
}
