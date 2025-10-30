import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const provision = (bucketName: pulumi.Output<string>) => {
    const stack = pulumi.getStack();
    const config = new pulumi.Config();
    const OPENROUTER_API_KEY = config.requireSecret("OPENROUTER_API_KEY");
    const AI_GATEWAY_API_KEY = config.requireSecret("AI_GATEWAY_API_KEY");

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

    const lambda = new aws.lambda.Function(
        `coolbooks-book-creator-lambda-${stack}`,
        {
            runtime: "nodejs20.x",
            code: new pulumi.asset.AssetArchive({
                ".": new pulumi.asset.FileArchive("../book-creator"),
            }),
            handler: "index.lambda_handler",
            role: lambdaRole.arn,
            timeout: 200,
            environment: {
                variables: {
                    BUCKET_NAME: bucketName,
                    OPENROUTER_API_KEY: OPENROUTER_API_KEY,
                    AI_GATEWAY_API_KEY: AI_GATEWAY_API_KEY,
                },
            },
        }
    );

    return lambda;
};

export default provision;
