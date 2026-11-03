import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { canEditBook } from "@/lib/books";
import { confirmPrint, parseAddress, printOfBook } from "@/lib/printing";

export const maxDuration = 300;

/** "Confirm & print": the customer approved the preview and the address. */
export const POST = async (req: NextRequest) => {
    const locale = req.cookies.get("NEXT_LOCALE")?.value || "de";
    const t = await getTranslations({ locale });

    const body = (await req.json()) as {
        bookId?: string;
        key?: string;
        approved?: boolean;
        address?: unknown;
    };
    if (!body.bookId || !(await canEditBook(body.bookId, body.key))) {
        return NextResponse.json({
            success: false,
            message: t("messages.unauthorized"),
        });
    }
    if (body.approved !== true) {
        return NextResponse.json({
            success: false,
            message: t("pages.print.must-approve"),
        });
    }
    const address = parseAddress(body.address);
    if (!address) {
        return NextResponse.json({
            success: false,
            message: t("pages.print.bad-address"),
        });
    }

    const print = await printOfBook(body.bookId);
    if (!print || print.status !== "AWAITING_CONFIRMATION") {
        return NextResponse.json({
            success: false,
            message: t("pages.print.already"),
        });
    }

    const ok = await confirmPrint(print.id, address);
    return NextResponse.json(
        ok ?
            { success: true, message: t("pages.print.sent") }
        :   { success: false, message: t("pages.print.failed") }
    );
};
