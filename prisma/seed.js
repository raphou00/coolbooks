import { PrismaClient } from '@prisma/client';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// type Orientation = 'portrait' | 'landscape';

// type ExportOptions = {
//     bookId: string;
//     outputPortraitPath: string;   // e.g. ./output/book-portrait.pdf
//     outputLandscapePath: string;  // e.g. ./output/book-landscape.pdf
//     logoUrlOrPath: string;        // local path or https://...
//     logoOpacity?: number;         // 0..1
//     textPadding?: number;         // px padding inside text half
//     fontSize?: number;            // main text size
//     titleFontSize?: number;       // optional title font for page number/title
//     highDPI?: boolean;            // false: A4 default; true: larger page size
// };

const A4_PORTRAIT = { width: 595.28, height: 841.89 };   // 72 DPI
const A4_LANDSCAPE = { width: 841.89, height: 595.28 };

async function fetchBuffer(urlOrPath) {
    if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
        const res = await axios.get<ArrayBuffer>(urlOrPath, { responseType: 'arraybuffer' });
        return Buffer.from(res.data);
    }
    return await fs.readFile(urlOrPath);
}

// Ensures watermark is 1:1 by padding as needed
async function ensureSquare(buffer, background = { r: 255, g: 255, b: 255 }) {
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) return buffer;
    if (meta.width === meta.height) return buffer;

    const size = Math.max(meta.width, meta.height);
    return await sharp({
        create: {
            width: size,
            height: size,
            channels: 3,
            background
        }
    })
        .composite([{ input: buffer, left: Math.floor((size - meta.width) / 2), top: Math.floor((size - meta.height) / 2) }])
        .png()
        .toBuffer();
}

function hexToRgb(hex) {
    // Supports #RRGGBB or RRGGBB
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    return { r, g, b };
}

function getPageSize(orientation, highDPI) {
    if (!highDPI) {
        return orientation === 'portrait' ? A4_PORTRAIT : A4_LANDSCAPE;
    }
    // Optional “high DPI” larger canvas: 1.5x
    const base = orientation === 'portrait' ? A4_PORTRAIT : A4_LANDSCAPE;
    return { width: base.width * 1.5, height: base.height * 1.5 };
}

async function embedImageAuto(pdf, data) {
    // Try PNG first, then JPEG
    try {
        return await pdf.embedPng(data);
    } catch {
        return await pdf.embedJpg(data);
    }
}

// Draws a semi-transparent centered square watermark (1:1)
async function drawWatermarkCenter(pdf, page, logoBuf, opacity = 0.1) {
    const logoSquare = await ensureSquare(logoBuf);
    const logo = await embedImageAuto(pdf, logoSquare);

    const { width: pw, height: ph } = page.getSize();

    // Watermark size as fraction of min dimension
    const size = Math.min(pw, ph) * 0.25; // 25% of page min dimension
    const x = (pw - size) / 2;
    const y = (ph - size) / 2;

    page.drawImage(logo, {
        x,
        y,
        width: size,
        height: size,
        opacity
    });
}

function drawWrappedText(page, text, x, yTop, width, font, fontSize, lineHeight, color = rgb(0, 0, 0)) {
    const words = text.replace(/\r/g, '').split(/\s+/);
    let line = '';
    let cursorY = yTop;

    for (let i = 0; i < words.length; i++) {
        const testLine = line ? `${line} ${words[i]}` : words[i];
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (testWidth > width && line) {
            page.drawText(line, { x, y: cursorY, size: fontSize, font, color });
            cursorY -= lineHeight;
            line = words[i];
        } else {
            line = testLine;
        }
    }
    if (line) {
        page.drawText(line, { x, y: cursorY, size: fontSize, font, color });
        cursorY -= lineHeight;
    }
}

async function createPdfForOrientation(book, pages, orientation, logoBuf, options) {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const { width: PW, height: PH } = getPageSize(orientation, options.highDPI ?? false);

    const logoOpacity = options.logoOpacity ?? 0.08;
    const fontSize = options.fontSize ?? 18;
    const titleFontSize = options.titleFontSize ?? 12;
    const textPadding = options.textPadding ?? 24;

    for (const p of pages) {
        const page = pdf.addPage([PW, PH]);

        const colorHex = (p.color && /^#?[0-9a-f]{6}$/i.test(p.color)) ? p.color : '#FFFFFF';
        const bg = hexToRgb(colorHex);
        // Background fill
        page.drawRectangle({
            x: 0,
            y: 0,
            width: PW,
            height: PH,
            color: rgb(bg.r, bg.g, bg.b)
        });

        // Layout: half for image, half for text. Decide split axis depending on orientation.
        // To keep consistent, we’ll split vertically for both: left half image, right half text.
        const halfW = PW / 2;

        // Draw image on the left half with cover/contain behavior and some padding
        const imgBuf = await fetchBuffer(p.image);
        const img = await embedImageAuto(pdf, imgBuf);
        const pad = 16;
        const imgBox = {
            x: pad,
            y: pad,
            width: halfW - pad * 2,
            height: PH - pad * 2
        };
        // Fit image preserving aspect ratio
        const imgAspect = img.width / img.height;
        const boxAspect = imgBox.width / imgBox.height;
        let drawW, drawH, drawX, drawY;
        if (imgAspect > boxAspect) {
            // image wider than box: fit width
            drawW = imgBox.width;
            drawH = drawW / imgAspect;
            drawX = imgBox.x;
            drawY = imgBox.y + (imgBox.height - drawH) / 2;
        } else {
            // image taller than box: fit height
            drawH = imgBox.height;
            drawW = drawH * imgAspect;
            drawX = imgBox.x + (imgBox.width - drawW) / 2;
            drawY = imgBox.y;
        }
        page.drawImage(img, {
            x: drawX,
            y: drawY,
            width: drawW,
            height: drawH
        });

        // Draw text on the right half
        const textAreaX = halfW + textPadding;
        const textAreaWidth = halfW - textPadding * 2;
        const textTop = PH - textPadding - fontSize;
        const lineHeight = fontSize * 1.4;

        // Optional top bar with page number
        const pageHeader = `Page ${p.number}`;
        page.drawText(pageHeader, {
            x: textAreaX,
            y: PH - textPadding - titleFontSize,
            size: titleFontSize,
            font: fontBold,
            color: rgb(0, 0, 0)
        });

        // Main text (wrap)
        const mainTextTop = PH - textPadding - titleFontSize - lineHeight;
        drawWrappedText(page, p.text || '', textAreaX, mainTextTop, textAreaWidth, font, fontSize, lineHeight, rgb(0, 0, 0));

        // Watermark (centered)
        await drawWatermarkCenter(pdf, page, logoBuf, logoOpacity);
    }

    // Document metadata
    pdf.setTitle(book.title ?? 'Book');
    pdf.setAuthor('Your App');
    pdf.setSubject('Exported Book');
    pdf.setCreationDate(new Date(book.createdAt || Date.now()));
    pdf.setModificationDate(new Date());

    return await pdf.save();
}

export async function exportBookToPdf(options) {
    const book = await prisma.book.findFirst({
        include: { pages: { orderBy: { number: 'asc' } } }
    });

    if (!book) {
        throw new Error('Book not found');
    }

    const pages = book.pages;
    if (!pages || pages.length === 0) {
        throw new Error('No pages found in the book');
    }

    const logoBuf = await fetchBuffer(options.logoUrlOrPath);

    // Portrait
    const portraitBytes = await createPdfForOrientation(book, pages, 'portrait', logoBuf, options);
    await fs.mkdir(require('path').dirname(options.outputPortraitPath), { recursive: true });
    await fs.writeFile(options.outputPortraitPath, portraitBytes);

    // Landscape
    const landscapeBytes = await createPdfForOrientation(book, pages, 'landscape', logoBuf, options);
    await fs.mkdir(require('path').dirname(options.outputLandscapePath), { recursive: true });
    await fs.writeFile(options.outputLandscapePath, landscapeBytes);

    return {
        portraitPath: options.outputPortraitPath,
        landscapePath: options.outputLandscapePath
    };
}

// Example CLI usage:
// npx ts-node generateBookPdf.ts <BOOK_ID> ./out/book-portrait.pdf ./out/book-landscape.pdf ./assets/logo.png
(async () => {
    try {
        const result = await exportBookToPdf({
            bookId,
            outputPortraitPath: "./out/book-portrait.pdf",
            outputLandscapePath: "./out/book-landscape.pdf",
            logoUrlOrPath: "../public/favicon-96x96.png",
            logoOpacity: 0.08,
            textPadding: 28,
            fontSize: 18,
            titleFontSize: 12,
            highDPI: false
        });
        console.log('PDFs generated:', result);
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
})();
