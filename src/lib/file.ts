import {
    S3Client,
    PutObjectCommand,
    ListObjectsV2Command,
    DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import type {
    PutObjectCommandInput,
    ListObjectsV2CommandOutput,
    PutObjectCommandOutput,
} from "@aws-sdk/client-s3";
import env from "@/lib/env";
import {
    deleteLocalPrefix,
    isLocal,
    readLocalFile,
    writeLocalFile,
} from "@/lib/local";

const s3 = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
});

export const getObject = (key: string) => {
    return `${env.CLOUDFRONT_URL}/${key}`;
};

/** The bytes of a stored file (local store, or through CloudFront). */
export const readObject = async (key: string): Promise<Buffer> => {
    if (isLocal) return readLocalFile(key);
    const res = await fetch(getObject(key));
    if (!res.ok) throw new Error(`Could not read ${key}: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
};

export const putObject = async (
    file: File | Buffer | Blob,
    key: string,
    type?: string
): Promise<PutObjectCommandOutput> => {
    let body: Buffer;
    let contentType = type ?? "application/octet-stream";

    if (file instanceof File) {
        body = Buffer.from(await file.arrayBuffer());
        contentType = type ?? file.type;
    } else if (file instanceof Blob) {
        body = Buffer.from(await file.arrayBuffer());
        contentType = type ?? "application/pdf";
    } else {
        body = file;
    }

    if (isLocal) {
        await writeLocalFile(key, body);
        return {} as PutObjectCommandOutput;
    }

    const params: PutObjectCommandInput = {
        Bucket: env.BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
    };

    try {
        const res = await s3.send(new PutObjectCommand(params));
        return res;
    } catch (err) {
        console.error("Error uploading to S3:", err);
        throw err;
    }
};

export const deleteObject = async (prefix: string) => {
    if (isLocal) return deleteLocalPrefix(prefix);

    let continuationToken: string | undefined = undefined;

    do {
        const listRes: ListObjectsV2CommandOutput = await s3.send(
            new ListObjectsV2Command({
                Bucket: env.BUCKET_NAME,
                Prefix: prefix.endsWith("/") ? prefix : `${prefix}/`,
                ContinuationToken: continuationToken,
            })
        );

        const contents = listRes.Contents ?? [];
        if (contents.length > 0) {
            const objects = contents.map((o: { Key?: string }) => ({
                Key: o.Key!,
            }));
            await s3.send(
                new DeleteObjectsCommand({
                    Bucket: env.BUCKET_NAME,
                    Delete: { Objects: objects, Quiet: true },
                })
            );
        }

        continuationToken =
            listRes.IsTruncated ? listRes.NextContinuationToken : undefined;
    } while (continuationToken);
};
