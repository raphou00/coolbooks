import { type NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import fs from "fs";
import path from "path";
import env from "@/lib/env";

interface Page {
    image: string;
    color: string;
    text: string;
}

interface BookData {
    cover: string;
    pages: Page[];
    title: string;
    author: string;
}

export async function POST(request: NextRequest) {
    try {
        const bookData: BookData = await request.json();

        const zip = new JSZip();

        zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

        const metaInf = zip.folder("META-INF");
        metaInf?.file(
            "container.xml",
            `<?xml version="1.0" encoding="UTF-8"?>
        <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles>
            <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
        </rootfiles>
        </container>`
        );

        const oebps = zip.folder("OEBPS");
        const images = oebps?.folder("images");

        const imagePromises = [
            { image: bookData.cover },
            ...bookData.pages,
        ].map(async (page: { image: string }, i: number) => {
            const imageUrl = env.CLOUDFRONT_URL + "/" + page.image;
            console.log(imageUrl);

            const response = await fetch(imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const ext = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
            const imageName = `page${i}.${ext}`;

            images?.file(imageName, buffer);

            return { index: i, imageName, ext };
        });

        const downloadedImages = await Promise.all(imagePromises);

        const imageManifest = downloadedImages
            .map((img) => {
                const mediaType =
                    img.ext === "png" ? "image/png" : "image/jpeg";
                return `    <item id="img${img.index}" href="images/${img.imageName}" media-type="${mediaType}"/>`;
            })
            .join("\n");

        const pageManifest = bookData.pages
            .map(
                (_: Page, i: number) =>
                    `    <item id="page${i}" href="page${i}.xhtml" media-type="application/xhtml+xml"/>`
            )
            .join("\n");

        const spineItems = bookData.pages
            .map((_: Page, i: number) => `    <itemref idref="page${i}"/>`)
            .join("\n");

        oebps?.file(
            "content.opf",
            `<?xml version="1.0" encoding="UTF-8"?>
        <package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
            <dc:title>${bookData.title}</dc:title>
            <dc:creator>${bookData.author}</dc:creator>
            <dc:language>en</dc:language>
            <dc:identifier id="book-id">${Date.now()}</dc:identifier>
        </metadata>
        <manifest>
            <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
            ${imageManifest}
            ${pageManifest}
            </manifest>
        <spine toc="ncx">
            ${spineItems}
        </spine>
        </package>`
        );

        const navPoints = bookData.pages
            .map(
                (page: Page, i: number) => `
        <navPoint id="page${i}" playOrder="${i + 1}">
        <navLabel><text>Page ${i + 1}</text></navLabel>
        <content src="page${i}.xhtml"/>
        </navPoint>`
            )
            .join("");

        oebps?.file(
            "toc.ncx",
            `<?xml version="1.0" encoding="UTF-8"?>
        <ncx version="2005-1" xmlns="http://www.daisy.org/z3986/2005/ncx/">
        <head>
            <meta name="dtb:uid" content="${Date.now()}"/>
        </head>
        <docTitle>
            <text>${bookData.title || "My Kid Book"}</text>
        </docTitle>
        <navMap>${navPoints}
        </navMap>
        </ncx>`
        );

        bookData.pages.forEach((page: Page, i: number) => {
            const imageInfo = downloadedImages.find((img) => img.index === i);

            oebps?.file(
                `page${i}.xhtml`,
                `<?xml version="1.0" encoding="UTF-8"?>
            <!DOCTYPE html>
            <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
            <title>Page ${i + 1}</title>
            <style>
                body {
                background-color: ${page.color};
                text-align: center;
                padding: 20px;
                margin: 0;
                font-family: Arial, sans-serif;
                }
                img {
                max-width: 100%;
                height: auto;
                margin-bottom: 20px;
                }
                p {
                font-size: 18px;
                color: #333;
                line-height: 1.6;
                }
            </style>
            </head>
            <body>
            <img src="images/${imageInfo?.imageName}" alt="Page ${i + 1}"/>
            <p>${page.text}</p>
            </body>
            </html>`
            );
        });

        const epubBuffer = await zip.generateAsync({
            type: "nodebuffer",
            mimeType: "application/epub+zip",
            compression: "DEFLATE",
            compressionOptions: { level: 9 },
        });

        const fileName = `${bookData.title || "kidbook"}.epub`;
        const outputPath = path.join(process.cwd(), "public", fileName);

        fs.writeFileSync(outputPath, epubBuffer);

        return NextResponse.json({
            success: true,
            message: "done",
        });
    } catch (error) {
        console.error("EPUB generation error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to generate EPUB",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
