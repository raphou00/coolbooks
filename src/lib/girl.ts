import Buffer from "buffer";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import type { Girl } from "@prisma/client";
import { putObject } from "./file";
import db from "./db";
import env from "./env";

export const getS3 = (key: string) => {
    return `https://${env.BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
};

export const getExtension = (filename: string) => {
    const parts = filename.split(".");
    return parts[parts.length - 1];
};

export const blurImage = async (file: File) => {
    return await sharp(await file.arrayBuffer())
        .blur(20)
        .toBuffer();
};

export const getImageMetadata = async (file: File) => {
    return await sharp(await file.arrayBuffer()).metadata();
};

export const getVideoMetadata = async (
    src: string
): Promise<{ width: number; height: number; time: number }> => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(src, (err, metadata) => {
            if (err) return reject(err);

            const time = metadata.format.duration;
            if (!time) {
                return reject(new Error("Video error"));
            }

            const size = metadata.streams.find((s) => s.width && s.height);

            if (!size || !size.width || !size.height) {
                return reject(new Error("Video error"));
            }
            const width = size.width;
            const height = size.height;

            resolve({ width, height, time });
        });
    });
};

export const getVideoThumbnail = async (src: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const buffer: Buffer[] = [];
        const stream = new PassThrough();

        ffmpeg(src)
            .seekInput(1)
            .format("image2pipe")
            .on("error", reject)
            .on("end", () => resolve(Buffer.Buffer.concat(buffer)))
            .pipe(stream);

        stream.on("data", (chunk) => buffer.push(chunk));
        stream.on("error", reject);
    });
};

export const createGirl = async (
    girlParams: Girl,
    avatar: File,
    cover: File
) => {
    const avatarName = crypto.randomUUID() + "." + getExtension(avatar.name);
    const coverName = crypto.randomUUID() + "." + getExtension(cover.name);

    await putObject(avatar, avatarName);
    await putObject(cover, coverName);

    const girl = await db.girl.create({
        data: {
            ...girlParams,
            avatar: avatarName,
            cover: coverName,
        },
    });

    return girl;
};

export const createMedia = async (girlId: string, description: string) => {
    const media = await db.media.create({
        data: {
            girlId,
            description,
        },
    });

    return media;
};

export const createImage = async (
    mediaId: string,
    file: File,
    free: boolean = false
) => {
    const fileName = crypto.randomUUID() + "." + getExtension(file.name);
    const blurredName = crypto.randomUUID() + "." + getExtension(file.name);

    await putObject(file, fileName);
    await putObject(await blurImage(file), blurredName);

    const metadata = await getImageMetadata(file);

    if (!metadata.width || !metadata.height) {
        throw new Error("Invalid image");
    }

    const media = await db.image.create({
        data: {
            mediaId: mediaId,
            src: fileName,
            blurred: blurredName,
            width: metadata.width,
            height: metadata.height,
            free,
        },
    });

    return media;
};

export const createVideo = async (
    mediaId: string,
    file: File,
    free: boolean = false
) => {
    const fileName = crypto.randomUUID() + "." + getExtension(file.name);
    const thumbnailName = crypto.randomUUID() + "." + getExtension(file.name);
    const thumbnailBlurredName =
        crypto.randomUUID() + "." + getExtension(file.name);

    await putObject(file, fileName);

    const thumbnail = await getVideoThumbnail(getS3(fileName));
    await putObject(thumbnail, thumbnailName);

    const blurredThumbnail = await sharp(thumbnail).blur(20).toBuffer();
    await putObject(blurredThumbnail, thumbnailBlurredName);

    const metadata = await getVideoMetadata(getS3(fileName));

    const media = await db.video.create({
        data: {
            mediaId: mediaId,
            src: fileName,
            blurred: thumbnailBlurredName,
            thumbnail: thumbnailName,
            width: metadata.width,
            height: metadata.height,
            time: metadata.time,
            free,
        },
    });

    return media;
};
