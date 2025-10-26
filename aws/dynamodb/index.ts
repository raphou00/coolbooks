import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const provision = () => {
    const dynamoTable = new aws.dynamodb.Table(
        `coolbooks-dynamo-${pulumi.getStack()}`,
        {
            name: `coolbooks-dynamo-${pulumi.getStack()}`,
            attributes: [
                {
                    name: "id",
                    type: "S",
                },
            ],
            hashKey: "id",
            billingMode: "PAY_PER_REQUEST",
        }
    );

    const tableName = dynamoTable.name;
    const tableArn = dynamoTable.arn;
};

export default provision;
