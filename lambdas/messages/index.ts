import AWS from "aws-sdk";
const ddb = new AWS.DynamoDB.DocumentClient();
const api = new AWS.ApiGatewayManagementApi({
    endpoint: process.env.WEBSOCKET_ENDPOINT,
});

const ADMIN_CONNECTION_ID = process.env.ADMIN_CONNECTION_ID!;
const TABLE_NAME = process.env.TABLE_NAME!;

type Event = {
    body: string;
};

exports.handler = async (event: Event) => {
    const body = JSON.parse(event.body);
    const { userId, message } = body;
    const timestamp = Date.now();

    await ddb
        .put({
            TableName: TABLE_NAME,
            Item: { userId, timestamp, message },
        })
        .promise();

    if (ADMIN_CONNECTION_ID) {
        try {
            await api
                .postToConnection({
                    ConnectionId: ADMIN_CONNECTION_ID,
                    Data: JSON.stringify({ userId, message, timestamp }),
                })
                .promise();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    return {
        statusCode: 200,
        body: "Message received",
    };
};
