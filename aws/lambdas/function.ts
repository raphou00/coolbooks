import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const provision = (table: aws.dynamodb.Table) => {
    const stack = pulumi.getStack();

    const lambdaRole = new aws.iam.Role(`pinksea-lambda-exec-role-${stack}`, {
        assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
            Service: "lambda.amazonaws.com",
        }),
    });

    new aws.iam.RolePolicyAttachment(`pinksea-lambda-basic-exec-${stack}`, {
        role: lambdaRole.name,
        policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
    });

    new aws.iam.RolePolicyAttachment(`pinksea-lambda-dynamo-access-${stack}`, {
        role: lambdaRole.name,
        policyArn: aws.iam.ManagedPolicy.AmazonDynamoDBFullAccess,
    });

    const messageLambda = new aws.lambda.Function(
        `pinksea-messageHandler-${stack}`,
        {
            runtime: aws.lambda.Runtime.NodeJS18dX,
            code: new pulumi.asset.AssetArchive({
                ".": new pulumi.asset.FileArchive("../lambda"),
            }),
            handler: "index.messageHandler",
            role: lambdaRole.arn,
            environment: {
                variables: {
                    CONNECTIONS_TABLE: table.name,
                },
            },
        }
    );

    const connectLambda = new aws.lambda.Function(
        `pinksea-connectHandler-${stack}`,
        {
            runtime: aws.lambda.Runtime.NodeJS18dX,
            code: new pulumi.asset.AssetArchive({
                ".": new pulumi.asset.FileArchive("../lambda"),
            }),
            handler: "index.connectHandler",
            role: lambdaRole.arn,
            environment: {
                variables: {
                    CONNECTIONS_TABLE: table.name,
                },
            },
        }
    );

    const disconnectLambda = new aws.lambda.Function(
        `pinksea-disconnectHandler-${stack}`,
        {
            runtime: aws.lambda.Runtime.NodeJS18dX,
            code: new pulumi.asset.AssetArchive({
                ".": new pulumi.asset.FileArchive("../lambda"),
            }),
            handler: "index.disconnectHandler",
            role: lambdaRole.arn,
            environment: {
                variables: {
                    CONNECTIONS_TABLE: table.name,
                },
            },
        }
    );

    return {
        messageLambda,
        connectLambda,
        disconnectLambda,
    };
};

export default provision;
