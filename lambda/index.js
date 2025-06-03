import { v4 as uuidv4 } from "uuid";
import ConnectionService from "./src/dynamodb.js";
import WebSocketService from "./src/websocket.js";

export const connectHandler = async (event) => {
    const { connectionId, domainName, stage } = event.requestContext;
    const { username, isAdmin } = event.queryStringParameters || {};

    if (!connectionId || !domainName || !stage) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Request context is required" })
        };
    }

    if (!username) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Username is required" })
        };
    }

    try {
        const connection = {
            connectionId,
            userId: uuidv4(),
            username,
            isAdmin: isAdmin === "true",
            connectedAt: new Date().toISOString(),
            timestamp: new Date().getTime()
        };

        await ConnectionService.saveConnection(connection);

        if (!connection.isAdmin) {
        const adminConnection = await ConnectionService.getAdminConnection();
        if (adminConnection) {
            const wsService = new WebSocketService(domainName, stage);
            const notification = {
                type: "userJoined",
                from: "System",
                content: `${username} joined the chat`,
                timestamp: new Date().toISOString(),
                messageId: uuidv4()
            };
            
            await wsService.sendMessage(adminConnection.connectionId, notification);
        }
        }

        return { statusCode: 200, body: "Connected" };
    } catch (error) {
        console.error("Connection error:", error);
        return { statusCode: 500, body: "Failed to connect" };
    }
};

export const disconnectHandler = async (event) => {
    const { connectionId, domainName, stage } = event.requestContext;

    if (!connectionId || !domainName || !stage) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Request context is required" })
        };
    }

    try {
        const connection = await ConnectionService.getConnection(connectionId);
        await ConnectionService.deleteConnection(connectionId);

        if (connection && !connection.isAdmin) {
            const adminConnection = await ConnectionService.getAdminConnection();
            if (adminConnection) {
                const wsService = new WebSocketService(domainName, stage);
                const notification = {
                    type: "userLeft",
                    from: "System",
                    content: `${connection.username} left the chat`,
                    timestamp: new Date().toISOString(),
                    messageId: uuidv4()
                };
                
                await wsService.sendMessage(adminConnection.connectionId, notification);
            }
        }

        return { statusCode: 200, body: "Disconnected" };
    } catch (error) {
        console.error("Disconnect error:", error);
        return { statusCode: 500, body: "Failed to disconnect" };
    }
};

export const messageHandler = async (event) => {
    const { connectionId, domainName, stage } = event.requestContext;

    if (!connectionId || !domainName || !stage) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Request context is required" })
        };
    }
    
    try {
        const sender = await ConnectionService.getConnection(connectionId);
        if (!sender) {
            return { statusCode: 400, body: "Connection not found" };
        }

        const messageData = JSON.parse(event.body || "{}");
        const wsService = new WebSocketService(domainName, stage);
        
        const message = {
            type: "message",
            from: sender.username,
            content: messageData.content,
            timestamp: new Date().toISOString(),
            messageId: uuidv4()
        };

        if (sender.isAdmin) {
            if (messageData.toUserId) {
                const targetConnection = await ConnectionService.getConnection(messageData.toUserId);
                if (targetConnection) {
                    message.to = targetConnection.username;
                    await wsService.sendMessage(targetConnection.connectionId, message);
                }
            } else {
                const userConnections = await ConnectionService.getUserConnections();
                await wsService.sendToMultiple(
                    userConnections.map(conn => conn.connectionId),
                    message
                );
            }
        } else {
            const adminConnection = await ConnectionService.getAdminConnection();
            if (adminConnection) {
                message.to = "Admin";
                await wsService.sendMessage(adminConnection.connectionId, message);
            } else {
                const errorMessage = {
                    type: "error",
                    from: "System",
                    content: "Admin is not available",
                    timestamp: new Date().toISOString(),
                    messageId: uuidv4()
                };
                await wsService.sendMessage(connectionId, errorMessage);
            }
        }

        return { statusCode: 200, body: "Message sent" };
    } catch (error) {
        console.error("Message error:", error);
        return { statusCode: 500, body: "Failed to send message" };
    }
};