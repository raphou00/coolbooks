import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const provision = (bucketName: pulumi.Output<string>) => {
    const stack = pulumi.getStack();
    const config = new pulumi.Config();
    const DATABASE_URL = config.requireSecret("DATABASE_URL");
    const OPENROUTER_API_KEY = config.requireSecret("OPENROUTER_API_KEY");
    const BOOK_CREATOR_SECRET = config.requireSecret("BOOK_CREATOR_SECRET");

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
            // 13 images with up to 3 attempts each can take several minutes.
            timeout: 900,
            environment: {
                variables: {
                    BUCKET_NAME: bucketName,
                    DATABASE_URL: DATABASE_URL,
                    OPENROUTER_API_KEY: OPENROUTER_API_KEY,
                    BOOK_CREATOR_SECRET: BOOK_CREATOR_SECRET,
                },
            },
        }
    );

    // A retried invocation would generate (and bill for) a second book.
    new aws.lambda.FunctionEventInvokeConfig(
        `coolbooks-book-creator-lambda-invoke-config-${stack}`,
        {
            functionName: lambda.name,
            maximumRetryAttempts: 0,
        }
    );

    return lambda;
};

export default provision;
