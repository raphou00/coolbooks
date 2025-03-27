import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import type {
    PutObjectCommandInput,
    DeleteObjectCommandInput,
} from "@aws-sdk/client-s3";
import env from "@/lib/env";

const s3 = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
});

export const getObject = async (key: string) => {
    return `${env.CLOUDFRONT_URL}/${key}`;
};

export const putObject = async (file: File, key: string) => {
    const params: PutObjectCommandInput = {
        Bucket: env.BUCKET_NAME,
        Key: key,
        Body: file,
    };

    try {
        const res = await s3.send(new PutObjectCommand(params));

        return res;
    } catch (err) {
        console.log("Error", err);
    }
};

export const deleteObject = async (key: string) => {
    const params: DeleteObjectCommandInput = {
        Bucket: env.BUCKET_NAME,
        Key: key,
    };

    try {
        const res = await s3.send(new DeleteObjectCommand(params));

        return res;
    } catch (err) {
        console.log("Error", err);
    }
};
