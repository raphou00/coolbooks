import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const provision = () => {
    const stack = pulumi.getStack();

    const messagesTable = new aws.dynamodb.Table(`pinksea-messages-${stack}`, {
        attributes: [
            { name: "userId", type: "S" },
            { name: "timestamp", type: "N" },
        ],
        hashKey: "userId",
        rangeKey: "timestamp",
        billingMode: "PAY_PER_REQUEST",
    });

    return messagesTable;
};

export default provision;
