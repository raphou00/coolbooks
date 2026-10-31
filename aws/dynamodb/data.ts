import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

/**
 * Main data table (users, sessions, books, pages, previews, orders).
 * Single-table design: see src/lib/db/keys.ts for the key layout.
 */
const provision = () => {
    const stack = pulumi.getStack();
    const s = (name: string) => ({ name, type: "S" });

    return new aws.dynamodb.Table(`coolbooks-data-table-${stack}`, {
        name: `coolbooks-data-${stack}`,
        billingMode: "PAY_PER_REQUEST",
        hashKey: "pk",
        rangeKey: "sk",
        attributes: [
            s("pk"),
            s("sk"),
            s("gsi1pk"),
            s("gsi1sk"),
            s("gsi2pk"),
            s("gsi2sk"),
        ],
        globalSecondaryIndexes: [
            // A user's sessions, tokens and books
            {
                name: "gsi1",
                hashKey: "gsi1pk",
                rangeKey: "gsi1sk",
                projectionType: "ALL",
            },
            // Orders by status, oldest first (order sweeper)
            {
                name: "gsi2",
                hashKey: "gsi2pk",
                rangeKey: "gsi2sk",
                projectionType: "ALL",
            },
        ],
        // Sessions, reset tokens and previews expire on their own.
        ttl: { enabled: true, attributeName: "ttl" },
        pointInTimeRecovery: { enabled: true },
        serverSideEncryption: { enabled: true },
        // Customer data: protect against accidental deletion outside dev.
        deletionProtectionEnabled: stack !== "dev",
    });
};

export default provision;
