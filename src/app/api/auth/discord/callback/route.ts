import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSession, discord } from "@/lib/auth";
import { type OAuth2Tokens } from "arctic";
import db from "@/lib/db";
import env from "@/lib/env";

export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedState = cookies().get("discord_oauth_state")?.value ?? null;
    const codeVerifier = cookies().get("discord_code_verifier")?.value ?? null;

    if (
        code === null ||
        state === null ||
        storedState === null ||
        codeVerifier === null
    ) {
        return NextResponse.json("Please restart the process.", {
            status: 400,
        });
    }
    if (state !== storedState) {
        return NextResponse.json("Please restart the process.", {
            status: 400,
        });
    }

    let tokens: OAuth2Tokens;
    try {
        tokens = await discord.validateAuthorizationCode(code, codeVerifier);
    } catch {
        return NextResponse.json("Please restart the process.", {
            status: 400,
        });
    }

    const token = tokens.accessToken();

    const discordResponse = await fetch("https://discord.com/api/users/@me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const discordData = await discordResponse.json();

    const discordId = discordData.id;
    const name = discordData.global_name ?? discordData.username;
    const email = discordData.email;

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
        return NextResponse.json("This email is already in use.", {
            status: 400,
        });
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
}
