import { 
  ApiGatewayManagementApiClient, 
  PostToConnectionCommand 
} from "@aws-sdk/client-apigatewaymanagementapi";

export default class WebSocketService {
    client;

    constructor(domainName, stage) {
        this.client = new ApiGatewayManagementApiClient({
            endpoint: `https://${domainName}/${stage}`
        });
    }

    async sendMessage(connectionId, message) {
        try {
            await this.client.send(new PostToConnectionCommand({
                ConnectionId: connectionId,
                Data: JSON.stringify(message)
            }));
            return true;
        } catch (error) {
            console.error(`Failed to send message to ${connectionId}:`, error);
            return false;
        }
    }

    async sendToMultiple(connectionIds, message) {
        const promises = connectionIds.map(id => this.sendMessage(id, message));
        await Promise.all(promises);
    }
}
