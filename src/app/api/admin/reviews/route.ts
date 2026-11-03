import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";

/** Admin: approve or hide a review. */
export const POST = async (req: NextRequest) => {
    const user = await getUser();
    if (user?.user?.role !== "ADMIN") {
        return NextResponse.json({ success: false }, { status: 403 });
    }
    const { printId, approved } = (await req.json()) as {
        printId?: string;
        approved?: boolean;
    };
    if (!printId || typeof approved !== "boolean") {
        return NextResponse.json({ success: false }, { status: 400 });
    }
    await db.reviews.setApproved(printId, approved);
    return NextResponse.json({ success: true });
};
