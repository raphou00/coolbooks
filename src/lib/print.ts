import jsPDF from "jspdf";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { sortPages } from "./utils";

/**
 * Print-ready PDF for a Gelato hardcover photo book (20 × 20 cm).
 *
 * File layout, one PDF (Gelato's photo book template):
 *   1. wraparound cover: back + spine + front, with the board wrap
 *   2. blank endpaper (not printed)
 *   3…  inner pages, single pages of 206 × 206 mm (200 mm + 3 mm bleed)
 *   last blank endpaper (not printed)
 *
 * Inner pages (right-hand pages are odd):
 *   1 title · 2 "this book belongs to" · 3 dedication (or blank)
 *   4–27 one spread per story page: picture left, text right
 *   28 "The End" · 29 colophon · 30… blank padding up to MIN_INNER_PAGES
 *
 * Check the result against a real sample before selling (see todo.md).
 */

export const TRIM_MM = 200;
export const BLEED_MM = 3;
export const PAGE_MM = TRIM_MM + 2 * BLEED_MM;
/** Text stays this far inside the trim line. */
export const SAFE_MM = 10;
/** Gelato photo books need 30–200 inner pages, in pairs. */
export const MIN_INNER_PAGES = 30;

export type CoverDimensions = {
    /** The whole cover sheet including the board wrap. */
    inside: Box;
    spine: Box;
    contentFront: Box;
    contentBack: Box;
    /** True when these are our own estimate, not Gelato's answer. */
    estimated: boolean;
};

type Box = { left: number; top: number; width: number; height: number };

export type PrintBook = {
    title: string;
    cover: string;
    dedication?: string | null;
    pages: { text: string; image: string; color: string; number: number }[];
};

export type PrintLabels = {
    belongsTo: string;
    theEnd: string;
    madeWith: string;
    backBlurb: string;
};

export type PrintWarning =
    | { kind: "title-missing" }
    | { kind: "text-too-long"; page: number }
    | { kind: "image-low-res"; page: number; px: number };

/**
 * Cover size for a 20 × 20 cm hardcover, used when Gelato can't be asked
 * (local mode, no API key). Same shape as Gelato's cover-dimensions answer.
 */
export const estimateCover = (innerPages: number): CoverDimensions => {
    const margin = 20; // wrap + edge, where the content area starts
    const joint = 8;
    const spineWidth = Math.max(4, Math.round(innerPages * 0.12 + 2));
    const contentW = TRIM_MM + 3;
    const contentH = TRIM_MM + 5;
    const width = 2 * margin + 2 * contentW + 2 * joint + spineWidth;
    const height = 2 * margin + contentH;
    return {
        inside: { left: 0, top: 0, width, height },
        contentBack: {
            left: margin,
            top: margin,
            width: contentW,
            height: contentH,
        },
        spine: {
            left: margin + contentW + joint,
            top: margin,
            width: spineWidth,
            height: contentH,
        },
        contentFront: {
            left: margin + contentW + 2 * joint + spineWidth,
            top: margin,
            width: contentW,
            height: contentH,
        },
        estimated: true,
    };
};

/** Map Gelato's cover-dimensions response onto our shape. */
export const parseGelatoCover = (
    res: Record<string, Box>
): CoverDimensions => ({
    inside: res.wraparoundInsideSize,
    spine: res.spineSize,
    contentFront: res.contentFrontSize,
    contentBack: res.contentBackSize,
    estimated: false,
});

const hexToRgb = (hex: string) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ?
            [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
        :   [255, 255, 255];
};

/** The logo from disk, or from the site when public/ isn't bundled (Vercel). */
const readLogo = async () => {
    try {
        return await readFile(
            path.join(process.cwd(), "public", "favicon-96x96.png")
        );
    } catch {
        const res = await fetch(`${process.env.APP_URL}/favicon-96x96.png`);
        if (!res.ok) throw new Error(`Logo: ${res.status}`);
        return Buffer.from(await res.arrayBuffer());
    }
};

const fontCache = new Map<string, string>();
const fetchFont = async (url: string) => {
    const hit = fontCache.get(url);
    if (hit) return hit;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Font ${url}: ${res.status}`);
    const b64 = Buffer.from(await res.arrayBuffer()).toString("base64");
    fontCache.set(url, b64);
    return b64;
};

/**
 * A picture as a print JPEG, cropped to fill `w × h` mm. Returns the data
 * URL and the source's pixel width (to warn about soft images).
 */
const printImage = async (
    loadImage: (key: string) => Promise<Buffer>,
    key: string,
    w: number,
    h: number
) => {
    const src = await loadImage(key);
    const meta = await sharp(src).metadata();
    const longest = 2400;
    const ratio = w / h;
    const outW = ratio >= 1 ? longest : Math.round(longest * ratio);
    const outH = ratio >= 1 ? Math.round(longest / ratio) : longest;
    const jpeg = await sharp(src)
        .resize({ width: outW, height: outH, fit: "cover" })
        .jpeg({ quality: 90 })
        .toBuffer();
    return {
        data: `data:image/jpeg;base64,${jpeg.toString("base64")}`,
        px: meta.width ?? 0,
    };
};

/** Inner pages before padding: 3 front pages + 2 per story page + 2 end pages. */
export const innerPageCount = (storyPages: number) => {
    const used = 3 + storyPages * 2 + 2;
    const atLeast = Math.max(used, MIN_INNER_PAGES);
    return atLeast % 2 === 0 ? atLeast : atLeast + 1;
};

export const buildPrintPDF = async ({
    book,
    labels,
    cover,
    loadImage,
}: {
    book: PrintBook;
    labels: PrintLabels;
    cover: CoverDimensions;
    /** Reads a stored image (S3 or the local file store) by key. */
    loadImage: (key: string) => Promise<Buffer>;
}) => {
    const warnings: PrintWarning[] = [];
    const pages = sortPages(book.pages);
    const inner = innerPageCount(pages.length);
    const ink: [number, number, number] = [35, 38, 74];
    const cream: [number, number, number] = [255, 248, 234];

    const pdf = new jsPDF({
        unit: "mm",
        format: [cover.inside.width, cover.inside.height],
        orientation: "landscape",
        compress: true,
    });

    pdf.addFileToVFS(
        "Poppins-Regular.ttf",
        await fetchFont(
            "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLDz8V1tvFP-KUEg.ttf"
        )
    );
    pdf.addFont("Poppins-Regular.ttf", "Poppins", "normal");
    pdf.addFileToVFS(
        "Poppins-Bold.ttf",
        await fetchFont(
            "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLGT9V1tvFP-KUEg.ttf"
        )
    );
    pdf.addFont("Poppins-Bold.ttf", "Poppins", "bold");

    const logo = await readLogo();
    const logoData = `data:image/png;base64,${logo.toString("base64")}`;

    if (!book.title.trim()) warnings.push({ kind: "title-missing" });

    /* ---------- 1. wraparound cover ---------- */
    {
        const { inside, spine, contentFront, contentBack } = cover;
        pdf.setFillColor(...cream);
        pdf.rect(0, 0, inside.width, inside.height, "F");

        // Front: the cover picture fills from the front board to the outer edge.
        const frontX = contentFront.left;
        const frontW = inside.width - frontX;
        const front = await printImage(
            loadImage,
            book.cover,
            frontW,
            inside.height
        );
        if (front.px < 1600) {
            warnings.push({ kind: "image-low-res", page: 0, px: front.px });
        }
        pdf.addImage(front.data, "JPEG", frontX, 0, frontW, inside.height);

        // Spine: title, read from top to bottom.
        if (spine.width >= 5) {
            pdf.setFillColor(...ink);
            pdf.rect(spine.left, 0, spine.width, inside.height, "F");
            pdf.setFont("Poppins", "bold");
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(Math.min(12, spine.width * 2));
            pdf.text(
                book.title,
                spine.left + spine.width / 2 + 1,
                spine.top + 15,
                { angle: -90 }
            );
        }

        // Back: title, short blurb and logo in the upper half (Gelato puts
        // its barcode near the bottom).
        const cx = contentBack.left + contentBack.width / 2;
        pdf.setFont("Poppins", "bold");
        pdf.setTextColor(...ink);
        pdf.setFontSize(20);
        pdf.text(
            pdf.splitTextToSize(book.title, contentBack.width - 30),
            cx,
            contentBack.top + 40,
            { align: "center" }
        );
        pdf.setFont("Poppins", "normal");
        pdf.setFontSize(12);
        pdf.text(
            pdf.splitTextToSize(labels.backBlurb, contentBack.width - 40),
            cx,
            contentBack.top + 62,
            { align: "center", lineHeightFactor: 1.5 }
        );
        pdf.addImage(logoData, "PNG", cx - 8, contentBack.top + 85, 16, 16);
        pdf.setFontSize(10);
        pdf.text("bibliboo.ch", cx, contentBack.top + 108, { align: "center" });
    }

    /* ---------- 2. front endpaper (blank) ---------- */
    pdf.addPage([PAGE_MM, PAGE_MM]);

    const safe = BLEED_MM + SAFE_MM;
    const textBox = PAGE_MM - 2 * safe;

    const plainPage = (rgb: number[] = cream) => {
        pdf.addPage([PAGE_MM, PAGE_MM]);
        pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
        pdf.rect(0, 0, PAGE_MM, PAGE_MM, "F");
    };

    const centered = (
        text: string,
        size: number,
        style: "normal" | "bold" = "normal",
        y = PAGE_MM / 2
    ) => {
        pdf.setFont("Poppins", style);
        pdf.setFontSize(size);
        pdf.setTextColor(...ink);
        pdf.text(pdf.splitTextToSize(text, textBox), PAGE_MM / 2, y, {
            align: "center",
            baseline: "middle",
            lineHeightFactor: 1.5,
        });
    };

    /* ---------- 3. inner pages ---------- */
    let count = 0;

    // 1: title page
    plainPage();
    centered(book.title, 26, "bold", PAGE_MM / 2 - 10);
    pdf.addImage(logoData, "PNG", PAGE_MM / 2 - 7, PAGE_MM / 2 + 20, 14, 14);
    count++;

    // 2: "this book belongs to"
    plainPage();
    centered(labels.belongsTo, 18, "normal", PAGE_MM / 2 - 15);
    pdf.setDrawColor(...ink);
    pdf.setLineWidth(0.4);
    pdf.line(
        safe + 25,
        PAGE_MM / 2 + 15,
        PAGE_MM - safe - 25,
        PAGE_MM / 2 + 15
    );
    count++;

    // 3: dedication, or a quiet blank page
    plainPage();
    if (book.dedication?.trim()) centered(book.dedication.trim(), 20);
    count++;

    // Story spreads
    for (const [i, page] of pages.entries()) {
        // Picture (left page), full bleed.
        pdf.addPage([PAGE_MM, PAGE_MM]);
        const img = await printImage(loadImage, page.image, PAGE_MM, PAGE_MM);
        if (img.px < 1600) {
            warnings.push({ kind: "image-low-res", page: i + 1, px: img.px });
        }
        pdf.addImage(img.data, "JPEG", 0, 0, PAGE_MM, PAGE_MM);
        count++;

        // Text (right page): the largest size that fits the safe area.
        plainPage(hexToRgb(page.color));
        pdf.setFont("Poppins", "normal");
        pdf.setTextColor(51, 51, 51);
        let size = 24;
        let lines: string[] = [];
        const lineH = (s: number) => s * 0.3528 * 1.6; // pt → mm × line height
        for (; size >= 12; size--) {
            pdf.setFontSize(size);
            lines = pdf.splitTextToSize(page.text, textBox);
            if (lines.length * lineH(size) <= textBox) break;
        }
        if (size < 12) {
            size = 12;
            warnings.push({ kind: "text-too-long", page: i + 1 });
        }
        pdf.setFontSize(size);
        const blockH = lines.length * lineH(size);
        pdf.text(lines, safe, PAGE_MM / 2 - blockH / 2 + lineH(size) * 0.7, {
            lineHeightFactor: 1.6,
        });
        count++;
    }

    // The End + colophon
    plainPage();
    centered(labels.theEnd, 30, "bold");
    count++;
    plainPage();
    centered(labels.madeWith, 10, "normal", PAGE_MM - safe - 5);
    count++;

    // Padding to Gelato's minimum, in pairs.
    while (count < inner) {
        plainPage();
        count++;
    }

    /* ---------- 4. back endpaper (blank) ---------- */
    pdf.addPage([PAGE_MM, PAGE_MM]);

    const buffer = Buffer.from(pdf.output("arraybuffer"));
    return { pdf: buffer, innerPages: count, warnings };
};
