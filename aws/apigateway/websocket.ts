import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const createIntegrationAndRoute = (wsApi: aws.apigatewayv2.Api, routeKey: string, lambda: aws.lambda.Function) => {
    const stack = pulumi.getStack();

    const integration = new aws.apigatewayv2.Integration(`pinksea-api-${routeKey}-integration-${stack}`, {
        apiId: wsApi.id,
        integrationType: "AWS_PROXY",
        integrationUri: lambda.arn,
        integrationMethod: "POST",
    });

    new aws.apigatewayv2.Route(`pinksea-api-${routeKey}-route-${stack}`, {
        apiId: wsApi.id,
        routeKey,
        target: pulumi.interpolate`integrations/${integration.id}`,
    });

    new aws.lambda.Permission(`pinksea-api-${routeKey.replace("$", "")}-permission-${stack}`, {
        action: "lambda:InvokeFunction",
        function: lambda.name,
        principal: "apigateway.amazonaws.com",
        sourceArn: pulumi.interpolate`${wsApi.executionArn}/*`,
    });
}

const provision = (
    connectLambda: aws.lambda.Function,
    disconnectLambda: aws.lambda.Function,
    messageLambda: aws.lambda.Function
) => {
    const stack = pulumi.getStack();

    const wsApi = new aws.apigatewayv2.Api(`pinksea-api-ws-${stack}`, {
        protocolType: "WEBSOCKET",
        routeSelectionExpression: "$request.body.action",
    });

    createIntegrationAndRoute(wsApi, "$connect", connectLambda);
    createIntegrationAndRoute(wsApi, "$disconnect", disconnectLambda);
    createIntegrationAndRoute(wsApi, "sendMessage", messageLambda);

    const stage = new aws.apigatewayv2.Stage(`pinksea-api-ws-stage-${stack}`, {
        apiId: wsApi.id,
        name: "$default",
        autoDeploy: true,
    });

    return stage;
};

export default provision;