import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import env from "@/lib/env";

/** Shared DynamoDB client. DYNAMODB_ENDPOINT points at DynamoDB Local in development. */
const client = new DynamoDBClient({
    region: env.AWS_REGION,
    // DynamoDB Local gets dummy credentials, never real AWS keys from the shell.
    credentials:
        env.DYNAMODB_ENDPOINT ?
            { accessKeyId: "local", secretAccessKey: "local" }
        :   {
                accessKeyId: env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
            },
    ...(env.DYNAMODB_ENDPOINT ? { endpoint: env.DYNAMODB_ENDPOINT } : {}),
});

export const ddb = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
});
