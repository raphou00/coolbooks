import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { google, createSession } from "@/lib/auth";
import { ObjectParser } from "@pilcrowjs/object-parser";
import { decodeIdToken, type OAuth2Tokens } from "arctic";
import db from "@/lib/db";
import env from "@/lib/env";

export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedState = cookies().get("google_oauth_state")?.value ?? null;
    const codeVerifier = cookies().get("google_code_verifier")?.value ?? null;

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
        tokens = await google.validateAuthorizationCode(code, codeVerifier);
    } catch {
        return NextResponse.json("Please restart the process.", {
            status: 400,
        });
    }

    const claims = decodeIdToken(tokens.idToken());
    const claimsParser = new ObjectParser(claims);

    const googleId = claimsParser.getString("sub");
    const name = claimsParser.getString("name");
    const email = claimsParser.getString("email");

    const existingUser = await db.user.findFirst({
        where: {
            googleId,
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
            googleId,
        },
    });

    await createSession(newUser.id);

    return NextResponse.redirect(new URL("/", env.APP_URL));
}
