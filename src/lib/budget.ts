import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import env from "@/lib/env";
import { ddb } from "@/lib/dynamo";
import { keys } from "@/lib/db/keys";
import { notifyAdmin } from "@/lib/orders";

const TableName = env.DATA_DYNAMODB_TABLE;
const month = () => new Date().toISOString().slice(0, 7);

/** AI spend recorded by the book creator this calendar month (UTC). */
export const getMonthSpend = async () => {
    const res = await ddb.send(
        new GetCommand({ TableName, Key: keys.budget(month()) })
    );
    return {
        usd: Number(res.Item?.usd ?? 0),
        calls: Number(res.Item?.calls ?? 0),
        alerted: Boolean(res.Item?.alertedAt),
        cap: env.AI_MONTHLY_BUDGET_USD,
    };
};

/**
 * True when this month's AI budget is spent. Free work (previews, redraws)
 * must stop then; the first time it happens the admin gets an email.
 */
export const isOverBudget = async () => {
    const spend = await getMonthSpend();
    if (spend.usd < spend.cap) return false;

    if (!spend.alerted) {
        try {
            // Only the first caller sets alertedAt, so one email per month.
            await ddb.send(
                new UpdateCommand({
                    TableName,
                    Key: keys.budget(month()),
                    UpdateExpression: "SET alertedAt = :t",
                    ConditionExpression: "attribute_not_exists(alertedAt)",
                    ExpressionAttributeValues: {
                        ":t": new Date().toISOString(),
                    },
                })
            );
            await notifyAdmin("AI budget reached", [
                `This month's AI spend is about $${spend.usd.toFixed(2)} (cap $${spend.cap}).`,
                `Free cover previews and redraws are paused until next month.`,
                `Paid books still finish. Raise AI_MONTHLY_BUDGET_USD to resume.`,
            ]);
        } catch {
            // Someone else already sent the alert.
        }
    }
    return true;
};
