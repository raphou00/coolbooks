import db from "./rds/db";
import bucket from "./s3/bucket";
import table from "./dynamodb/table";
import lambda from "./lambdas/function";
import websocket from "./apigateway/websocket";

const rds = db();
const { files, cloudfront } = bucket();
const dynamodb = table();
const { connectLambda, disconnectLambda, messageLambda } = lambda(dynamodb);
const api = websocket(connectLambda, disconnectLambda, messageLambda);

export const apiUrl = api.invokeUrl;
export const dynamodbTable = dynamodb.name;
export const dbEndpoint = rds.endpoint;
export const bucketName = files.bucket;
export const cloudfrontUrl = cloudfront.domainName;
