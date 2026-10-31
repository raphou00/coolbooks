/**
 * Create the data and rate-limit tables in DynamoDB Local for development.
 *
 *   docker run -d -p 8001:8000 amazon/dynamodb-local:2.5.4 -jar DynamoDBLocal.jar -sharedDb -inMemory
 *   bun run db:local
 *
 * Uses DYNAMODB_ENDPOINT, DATA_DYNAMODB_TABLE and RATE_LIMITS_DYNAMODB_TABLE from .env.
 */
import {
    CreateTableCommand,
    DynamoDBClient,
    ListTablesCommand,
    type CreateTableCommandInput,
} from "@aws-sdk/client-dynamodb";

const endpoint = process.env.DYNAMODB_ENDPOINT;
if (!endpoint) {
    console.error("Set DYNAMODB_ENDPOINT (e.g. http://localhost:8001) first.");
    process.exit(1);
}

const client = new DynamoDBClient({
    endpoint,
    region: process.env.AWS_REGION || "eu-central-2",
    credentials: { accessKeyId: "local", secretAccessKey: "local" },
});

const S = (AttributeName: string) => ({
    AttributeName,
    AttributeType: "S" as const,
});
const gsi = (name: string) => ({
    IndexName: name,
    KeySchema: [
        { AttributeName: `${name}pk`, KeyType: "HASH" as const },
        { AttributeName: `${name}sk`, KeyType: "RANGE" as const },
    ],
    Projection: { ProjectionType: "ALL" as const },
});

const tables: CreateTableCommandInput[] = [
    {
        TableName: process.env.DATA_DYNAMODB_TABLE!,
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: [
            { AttributeName: "pk", KeyType: "HASH" },
            { AttributeName: "sk", KeyType: "RANGE" },
        ],
        AttributeDefinitions: [
            S("pk"),
            S("sk"),
            S("gsi1pk"),
            S("gsi1sk"),
            S("gsi2pk"),
            S("gsi2sk"),
        ],
        GlobalSecondaryIndexes: [gsi("gsi1"), gsi("gsi2")],
    },
    {
        TableName: process.env.RATE_LIMITS_DYNAMODB_TABLE!,
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        AttributeDefinitions: [S("id")],
    },
];

const existing = new Set(
    (await client.send(new ListTablesCommand({}))).TableNames ?? []
);
for (const table of tables) {
    if (existing.has(table.TableName!)) {
        console.log(`✓ ${table.TableName} already exists`);
        continue;
    }
    await client.send(new CreateTableCommand(table));
    console.log(`+ created ${table.TableName}`);
}
