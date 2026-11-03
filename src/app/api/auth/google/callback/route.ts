import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { google, createSession, getUser } from "@/lib/auth";
import { ObjectParser } from "@pilcrowjs/object-parser";
import { decodeIdToken, type OAuth2Tokens } from "arctic";
import db from "@/lib/db";
import env from "@/lib/env";

export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        const url = new URL(req.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const storedState =
            (await cookies()).get("google_oauth_state")?.value ?? null;
        const codeVerifier =
            (await cookies()).get("google_code_verifier")?.value ?? null;

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
            tokens = await google.validateAuthorizationCode(code, codeVerifier);
        } catch {
            return NextResponse.redirect(new URL("/error?error=400", req.url));
        }

        const claims = decodeIdToken(tokens.idToken());
        const claimsParser = new ObjectParser(claims);

        const googleId = claimsParser.getString("sub");
        const name = claimsParser.getString("name");
        const email = claimsParser.getString("email");

        if (user?.user && !user.user.googleId) {
            await db.users.update(user.user.id, { googleId });
            return NextResponse.redirect(new URL("/account", env.APP_URL));
        }

        const existingUser = await db.users.byGoogleId(googleId);

        if (existingUser) {
            await createSession(existingUser.id);
            return NextResponse.redirect(new URL("/", env.APP_URL));
        }

        const existingEmail = await db.users.byEmail(email);

        if (existingEmail) {
            return NextResponse.redirect(
                new URL(
                    `/social-exists?name=${name}&googleId=${googleId}`,
                    req.url
                )
            );
        }

        const newUser = await db.users.create({ name, email, googleId });

        await createSession(newUser.id);

        return NextResponse.redirect(new URL("/", env.APP_URL));
    } catch (err) {
        console.error(err);
        return NextResponse.redirect(new URL("/error?error=500", req.url));
    }
}
