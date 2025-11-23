import jsPDF from "jspdf";
import JSZip from "jszip";
import env from "@/lib/env";
import type { BookProps } from "@/app/[locale]/(main)/book/[bookId]/book";

export const exportEPUB = async (book: BookProps["book"]) => {
    try {
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

        const coverResponse = await fetch(
            env.CLOUDFRONT_URL + "/" + book.cover
        );
        const coverBlob = await coverResponse.blob();
        const coverBuffer = await coverBlob.arrayBuffer();
        const coverExt = book.cover.split(".").pop()?.split("?")[0] || "jpg";
        images?.file(`cover.${coverExt}`, coverBuffer);

        const imagePromises = book.pages.map(async (page, i) => {
            const response = await fetch(env.CLOUDFRONT_URL + "/" + page.image);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();

            const ext = page.image.split(".").pop()?.split("?")[0] || "jpg";
            const imageName = `page${i}.${ext}`;

            images?.file(imageName, arrayBuffer);

            return { index: i, imageName, ext };
        });

        const downloadedImages = await Promise.all(imagePromises);

        const coverMediaType = coverExt === "png" ? "image/png" : "image/jpeg";

        oebps?.file(
            "content.opf",
            `<?xml version="1.0" encoding="UTF-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${book.title}</dc:title>
    <dc:creator>${book.user.name}</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="book-id">urn:uuid:${Date.now()}</dc:identifier>
    <meta name="cover" content="cover-image"/>
    <meta property="rendition:layout">pre-paginated</meta>
    <meta property="rendition:orientation">portrait</meta>
    <meta property="rendition:spread">none</meta>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
    <item id="cover-image" href="images/cover.${coverExt}" media-type="${coverMediaType}" properties="cover-image"/>
${downloadedImages
    .map((img) => {
        const mediaType = img.ext === "png" ? "image/png" : "image/jpeg";
        return `    <item id="img${img.index}" href="images/${img.imageName}" media-type="${mediaType}"/>`;
    })
    .join("\n")}
${book.pages
    .map(
        (_, i) =>
            `    <item id="page${i}" href="page${i}.xhtml" media-type="application/xhtml+xml"/>`
    )
    .join("\n")}


  </manifest>
  <spine toc="ncx">
    <itemref idref="cover" linear="no"/>
${book.pages.map((_, i) => `    <itemref idref="page${i}"/>`).join("\n")}
  </spine>
  <guide>
    <reference type="cover" title="Cover" href="cover.xhtml"/>
  </guide>
</package>`
        );

        oebps?.file(
            "toc.ncx",
            `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx version="2005-1" xmlns="http://www.daisy.org/z3986/2005/ncx/">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${Date.now()}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="${book.pages.length}"/>
    <meta name="dtb:maxPageNumber" content="${book.pages.length}"/>
  </head>
  <docTitle>
    <text>${book.title}</text>
  </docTitle>
  <navMap>
    <navPoint id="cover" playOrder="1">
      <navLabel><text>Cover</text></navLabel>
      <content src="cover.xhtml"/>
    </navPoint>
${book.pages
    .map(
        (_, i) => `    <navPoint id="page${i}" playOrder="${i + 2}">
      <navLabel><text>Page ${i + 1}</text></navLabel>
      <content src="page${i}.xhtml"/>
    </navPoint>`
    )
    .join("\n")}
  </navMap>
</ncx>`
        );

        oebps?.file(
            "cover.xhtml",
            `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta name="viewport" content="width=800, height=800"/>
<title>Cover</title>
<style type="text/css">
html, body {
    margin: 0;
    padding: 0;
    width: 800px;
    height: 800px;
}
body {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #000;
}
img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
</style>
</head>
<body>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="100%" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet">
<image width="800" height="800" xlink:href="images/cover.${coverExt}"/>


</svg>
</body>
</html>`
        );

        book.pages.forEach((page, i) => {
            const imageInfo = downloadedImages.find((img) => img.index === i);

            oebps?.file(
                `page${i}.xhtml`,
                `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta name="viewport" content="width=800, height=800"/>
<title>Page ${i + 1}</title>
<style type="text/css">
html, body {
    margin: 0;
    padding: 0;
    width: 800px;
    height: 800px;
    overflow: hidden;
}
body {
    background-color: ${page.color};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: Arial, sans-serif;
}
.content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
    box-sizing: border-box;
}
img {
    max-width: 100%;
    max-height: 60%;
    object-fit: contain;
    margin-bottom: 20px;
}
p {
    font-size: 24px;
    color: #333;
    line-height: 1.6;
    text-align: center;
    margin: 0;
}
</style>
</head>
<body>
<div class="content">
    <img src="images/${imageInfo?.imageName}" alt="

Page ${i + 1}"/>
    <p>${page.text}</p>
</div>
</body>
</html>`
            );
        });

        const epubBlob = await zip.generateAsync({
            type: "blob",
            mimeType: "application/epub+zip",
            compression: "DEFLATE",
            compressionOptions: { level: 9 },
        });

        return epubBlob;
    } catch (err) {
        console.log("Error generating EPUB:" + err);
    }
};

export const exportPDF = async (
    book: BookProps["book"],
    orientation: "portrait" | "landscape" = "portrait"
) => {
    try {
        const pdf = new jsPDF({
            orientation: orientation,
            unit: "mm",
            format: "a4",
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - margin * 2;

        const imageSize =
            orientation === "portrait" ?
                Math.min(contentWidth, pageHeight - margin * 2 - 40)
            :   Math.min(contentWidth * 0.6, pageHeight - margin * 2 - 40);

        const imageToDataURL = async (url: string): Promise<string> => {
            const response = await fetch(env.CLOUDFRONT_URL + "/" + url);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString("base64");
            const ext = url.toLowerCase().includes(".png") ? "png" : "jpeg";
            return `data:image/${ext};base64,${base64}`;
        };

        pdf.deletePage(1);

        const coverDataURL = await imageToDataURL(book.cover);
        pdf.addPage();
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");

        const coverSize = Math.min(pageWidth, pageHeight);
        const coverX = (pageWidth - coverSize) / 2;
        const coverY = (pageHeight - coverSize) / 2;
        pdf.addImage(
            coverDataURL,
            "JPEG",
            coverX,
            coverY,
            coverSize,
            coverSize,
            undefined,
            "FAST"
        );

        for (let i = 0; i < book.pages.length; i++) {
            const page = book.pages[i];
            pdf.addPage();

            const rgb = hexToRgb(page.color);
            pdf.setFillColor(rgb.r, rgb.g, rgb.b);
            pdf.rect(0, 0, pageWidth, pageHeight, "F");

            try {
                const imageDataURL = await imageToDataURL(page.image);
                const imageX = (pageWidth - imageSize) / 2;
                const imageY = margin;

                pdf.addImage(
                    imageDataURL,
                    "JPEG",
                    imageX,
                    imageY,
                    imageSize,
                    imageSize,
                    undefined,
                    "FAST"
                );

                pdf.setFontSize(16);
                pdf.setTextColor(51, 51, 51);
                const textY = imageY + imageSize + 15;
                const lines = pdf.splitTextToSize(page.text, contentWidth);
                pdf.text(lines, pageWidth / 2, textY, { align: "center" });
            } catch (e) {
                console.error(`Failed to add image for page ${i}:`, e);
            }
        }

        const pdfBuffer = pdf.output("blob");

        return pdfBuffer;
    } catch (err) {
        console.log("Error generating PDF: " + err);
    }
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
            {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
        :   { r: 255, g: 255, b: 255 };
}
