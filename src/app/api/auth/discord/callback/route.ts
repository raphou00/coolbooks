import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createSession, discord, getUser } from "@/lib/auth";
import { type OAuth2Tokens } from "arctic";
import db from "@/lib/db";
import env from "@/lib/env";

export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        const url = new URL(req.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const storedState =
            (await cookies()).get("discord_oauth_state")?.value ?? null;
        const codeVerifier =
            (await cookies()).get("discord_code_verifier")?.value ?? null;

        if (
            code === null ||
            state === null ||
            storedState === null ||
            codeVerifier === null
        ) {
            return NextResponse.redirect(new URL("/error?error=400", req.url));
        }
        if (state !== storedState) {
            return NextResponse.redirect(new URL("/error?error=400", req.url));
        }

        let tokens: OAuth2Tokens;
        try {
            tokens = await discord.validateAuthorizationCode(
                code,
                codeVerifier
            );
        } catch {
            return NextResponse.redirect(new URL("/error?error=400", req.url));
        }

        const token = tokens.accessToken();

        const discordResponse = await fetch(
            "https://discord.com/api/users/@me",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const discordData = await discordResponse.json();

        const discordId = discordData.id;
        const name = discordData.global_name ?? discordData.username;
        const email = discordData.email;

        if (user?.user && !user.user.discordId) {
            await db.user.update({
                where: {
                    id: user.user.id,
                },
                data: {
                    discordId,
                },
            });
            return NextResponse.redirect(
                new URL("/account/socials", env.APP_URL)
            );
        }

        const existingUser = await db.user.findFirst({
            where: {
                discordId,
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
                    `/social-exists?name=${name}&discordId=${discordId}`,
                    req.url
                )
            );
        }

        const newUser = await db.user.create({
            data: {
                name,
                email,
                discordId,
            },
        });

        await createSession(newUser.id);

        return NextResponse.redirect(new URL("/", env.APP_URL));
    } catch (_) {
        return NextResponse.redirect(new URL("/error?error=403", req.url));
    }
}
