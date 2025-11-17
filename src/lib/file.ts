import {
    S3Client,
    PutObjectCommand,
    ListObjectsV2Command,
    DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import type {
    PutObjectCommandInput,
    ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import env from "@/lib/env";

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

export const putObject = async (file: File | Buffer, key: string) => {
    const body =
        file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;
    const params: PutObjectCommandInput = {
        Bucket: env.BUCKET_NAME,
        Key: key,
        Body: body,
    };

    try {
        const res = await s3.send(new PutObjectCommand(params));

        return res;
    } catch (err) {
        console.error("Error", err);
    }
};

export const deleteObject = async (prefix: string) => {
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
