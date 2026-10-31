import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const provision = (
    bucketName: pulumi.Output<string>,
    dataTable: aws.dynamodb.Table
) => {
    const stack = pulumi.getStack();
    const config = new pulumi.Config();
    const OPENROUTER_API_KEY = config.requireSecret("OPENROUTER_API_KEY");
    /** Same value as LAMBDA_CALLBACK_SECRET in the web app. */
    const CALLBACK_SECRET = config.requireSecret("CALLBACK_SECRET");

    const lambdaRole = new aws.iam.Role(
        `coolbooks-book-creator-lambda-role-${stack}`,
        {
            assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
                Service: "lambda.amazonaws.com",
            }),
        }
    );

    new aws.iam.RolePolicyAttachment(
        `coolbooks-book-creator-lambda-role-policy-${stack}`,
        {
            role: lambdaRole.name,
            policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
        }
    );

    const s3Policy = new aws.iam.Policy(
        `coolbooks-book-creator-lambda-role-policy-${stack}`,
        {
            policy: bucketName.apply((bucketName) =>
                JSON.stringify({
                    Version: "2012-10-17",
                    Statement: [
                        {
                            Effect: "Allow",
                            Action: "s3:PutObject",
                            Resource: [
                                `arn:aws:s3:::${bucketName}/*`,
                                `arn:aws:s3:::${bucketName}`,
                            ],
                        },
                    ],
                })
            ),
        }
    );

    const dataPolicy = new aws.iam.Policy(
        `coolbooks-book-creator-lambda-data-policy-${stack}`,
        {
            policy: dataTable.arn.apply((arn) =>
                JSON.stringify({
                    Version: "2012-10-17",
                    Statement: [
                        {
                            Effect: "Allow",
                            Action: [
                                "dynamodb:GetItem",
                                "dynamodb:PutItem",
                                "dynamodb:UpdateItem",
                                "dynamodb:Query",
                                "dynamodb:BatchWriteItem",
                            ],
                            Resource: [arn, `${arn}/index/*`],
                        },
                    ],
                })
            ),
        }
    );

    new aws.iam.RolePolicyAttachment(
        `coolbooks-book-creator-lambda-data-policy-attachment-${stack}`,
        {
            role: lambdaRole.name,
            policyArn: dataPolicy.arn,
        }
    );

    new aws.iam.RolePolicyAttachment(
        `coolbooks-book-creator-lambda-role-policy-attachment-${stack}`,
        {
            role: lambdaRole.name,
            policyArn: s3Policy.arn,
        }
    );

    const lambda = new aws.lambda.Function(
        `coolbooks-book-creator-lambda-${stack}`,
        {
            runtime: "nodejs20.x",
            code: new pulumi.asset.AssetArchive({
                ".": new pulumi.asset.FileArchive("../book-creator"),
            }),
            handler: "index.lambda_handler",
            role: lambdaRole.arn,
            // 12 illustrations can take several minutes; 900 s is the maximum.
            timeout: 900,
            memorySize: 512,
            environment: {
                variables: {
                    BUCKET_NAME: bucketName,
                    DATA_TABLE: dataTable.name,
                    OPENROUTER_API_KEY: OPENROUTER_API_KEY,
                    CALLBACK_SECRET: CALLBACK_SECRET,
                },
            },
        }
    );

    // No automatic AWS retries: the web app's order sweeper owns retries,
    // so a paid book is never generated twice in parallel.
    new aws.lambda.FunctionEventInvokeConfig(
        `coolbooks-book-creator-invoke-config-${stack}`,
        {
            functionName: lambda.name,
            maximumRetryAttempts: 0,
            maximumEventAgeInSeconds: 3600,
        }
    );

    return lambda;
};

export default provision;
