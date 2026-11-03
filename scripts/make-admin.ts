/**
 * Give an existing account the ADMIN role (review moderation, all books).
 *
 *   bun run make-admin you@example.com
 *
 * Uses DATA_DYNAMODB_TABLE and, for local development, DYNAMODB_ENDPOINT
 * from .env. Register the account on the site first.
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
    console.error("Usage: bun run make-admin <email>");
    process.exit(1);
}

const endpoint = process.env.DYNAMODB_ENDPOINT;
const ddb = DynamoDBDocumentClient.from(
    new DynamoDBClient({
        region: process.env.AWS_REGION || "eu-central-2",
        ...(endpoint ?
            {
                endpoint,
                credentials: { accessKeyId: "local", secretAccessKey: "local" },
            }
        :   {}),
    })
);
const TableName = process.env.DATA_DYNAMODB_TABLE!;

const guard = await ddb.send(
    new GetCommand({ TableName, Key: { pk: `EMAIL#${email}`, sk: "EMAIL" } })
);
const userId = guard.Item?.userId as string | undefined;
if (!userId) {
    console.error(`No account for ${email}. Register on the site first.`);
    process.exit(1);
}

await ddb.send(
    new UpdateCommand({
        TableName,
        Key: { pk: `USER#${userId}`, sk: "PROFILE" },
        UpdateExpression: "SET #r = :admin",
        ExpressionAttributeNames: { "#r": "role" },
        ExpressionAttributeValues: { ":admin": "ADMIN" },
    })
);
console.log(`✓ ${email} is now an admin`);
