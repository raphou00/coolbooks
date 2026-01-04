import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
} from "@aws-sdk/lib-dynamodb";
import env from "./env";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = env.RATE_LIMITS_DYNAMODB_TABLE;

export const checkRateLimit = async (
    identifier: string,
    props: { maxRequests: number; windowSeconds: number }
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> => {
    const { maxRequests, windowSeconds } = props;
    const now = Math.floor(Date.now() / 1000);
    const windowKey = `${identifier}:${Math.floor(now / windowSeconds)}`;
    const resetAt = (Math.floor(now / windowSeconds) + 1) * windowSeconds;

    try {
        const { Item } = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { id: windowKey },
            })
        );

        const currentCount = Item?.count || 0;

        if (currentCount >= maxRequests) {
            return { allowed: false, remaining: 0, resetAt };
        }

        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    id: windowKey,
                    count: currentCount + 1,
                    ttl: now + windowSeconds + 86400,
                },
            })
        );

        return {
            allowed: true,
            remaining: maxRequests - currentCount - 1,
            resetAt,
        };
    } catch (error) {
        console.error("Rate limit check failed:", error);
        return { allowed: true, remaining: maxRequests, resetAt };
    }
};

export const ratelimitBase = { maxRequests: 100, windowSeconds: 60 };

export const ratelimitPost = { maxRequests: 20, windowSeconds: 60 };

export const ratelimitLogin = { maxRequests: 5, windowSeconds: 180 };

export const ratelimitContact = { maxRequests: 3, windowSeconds: 3600 };

export const ratelimitRegiser = { maxRequests: 10, windowSeconds: 3600 * 24 };

export const ratelimitForgotPassword = { maxRequests: 3, windowSeconds: 3600 };
