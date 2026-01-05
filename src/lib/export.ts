import jsPDF from "jspdf";
import fetch from "node-fetch";
import env from "@/lib/env";
import { domain } from "@/config/seo";
import { sortPages } from "./utils";

export type Book = {
    bookId: string;
    email: string;
    locale: string;
    title: string;
    cover: string;
    pages: {
        text: string;
        image: string;
        color: string;
        number: number;
    }[];
};

export const exportPDF = async (book: Book) => {
    try {
        const SQUARE_SIZE = 200;

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: [SQUARE_SIZE, SQUARE_SIZE],
        });

        const poppinsRegular = await fetchFont(
            "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLDz8V1tvFP-KUEg.ttf"
        );
        const poppinsBold = await fetchFont(
            "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLGT9V1tvFP-KUEg.ttf"
        );

        pdf.addFileToVFS("Poppins-Regular.ttf", poppinsRegular);
        pdf.addFont("Poppins-Regular.ttf", "Poppins", "normal");

        pdf.addFileToVFS("Poppins-Bold.ttf", poppinsBold);
        pdf.addFont("Poppins-Bold.ttf", "Poppins", "bold");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imageToBase64 = async (url: string): Promise<string> => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch image: ${response.statusText}`
                    );
                }

                const buffer = await response.buffer();
                const base64 = buffer.toString("base64");

                const ext = url.toLowerCase().endsWith(".png") ? "png" : "jpeg";
                return `data:image/${ext};base64,${base64}`;
            } catch (error) {
                console.error(`Error fetching image ${url}:`, error);
                throw error;
            }
        };

        pdf.deletePage(1);

        try {
            const coverBase64 = await imageToBase64(
                env.CLOUDFRONT_URL + "/" + book.cover
            );
            pdf.addPage();
            pdf.addImage(coverBase64, "JPEG", 0, 0, pageWidth, pageHeight);

            const logoSize = 15;
            const padding = 5;
            const logoX = padding;
            const logoY = pageHeight - logoSize - padding;

            try {
                const logoBase64 = await imageToBase64(
                    domain + "/favicon-96x96.png"
                );
                pdf.addImage(
                    logoBase64,
                    "PNG",
                    logoX,
                    logoY,
                    logoSize,
                    logoSize
                );
            } catch (error) {
                console.error("Failed to add logo:", error);
            }

            const textX = logoX + logoSize + 3;
            const textY = logoY + logoSize - 2;
            pdf.setFont("Poppins", "bold");
            pdf.setFontSize(12);
            pdf.setTextColor(255, 255, 255);
            pdf.text("Created on coolbooks.app", textX, textY);
        } catch (error) {
            console.error("Failed to add cover:", error);
        }

        const sortedPages = sortPages(book.pages);
        for (let i = 0; i < sortedPages.length; i++) {
            const page = sortedPages[i];
            const rgb = hexToRgb(page.color);

            pdf.addPage();
            pdf.setFillColor(rgb.r, rgb.g, rgb.b);
            pdf.rect(0, 0, pageWidth, pageHeight, "F");

            try {
                const imageBase64 = await imageToBase64(
                    env.CLOUDFRONT_URL + "/" + page.image
                );
                pdf.addImage(imageBase64, "JPEG", 0, 0, pageWidth, pageHeight);
            } catch (error) {
                console.error(`Failed to add image for page ${i}:`, error);
            }

            pdf.addPage();
            pdf.setFillColor(rgb.r, rgb.g, rgb.b);
            pdf.rect(0, 0, pageWidth, pageHeight, "F");

            pdf.setFont("Poppins", "bold");
            pdf.setFontSize(24);
            pdf.setTextColor(51, 51, 51);

            const textX = pageWidth / 2;
            const textY = pageHeight / 2;
            const contentWidth = pageWidth - 20;
            const lines = pdf.splitTextToSize(page.text, contentWidth);
            pdf.text(lines, textX, textY, { align: "center" });
        }

        return pdf.output("blob");
    } catch (err) {
        console.error("Error generating PDF:", err);
        throw err;
    }
};

const fetchFont = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch font: ${response.statusText}`);
        }

        const buffer = await response.buffer();
        return buffer.toString("base64");
    } catch (error) {
        console.error(`Error fetching font ${url}:`, error);
        throw error;
    }
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
            {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
        :   { r: 255, g: 255, b: 255 };
};
