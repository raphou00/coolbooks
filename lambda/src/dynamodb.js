import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  DeleteCommand, 
  ScanCommand 
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;

export default  class ConnectionService {
    static async saveConnection(connection) {
        await docClient.send(new PutCommand({
            TableName: CONNECTIONS_TABLE,
            Item: connection
        }));
    }

    static async getConnection(connectionId) {
        const result = await docClient.send(new GetCommand({
            TableName: CONNECTIONS_TABLE,
            Key: { connectionId }
        }));
        
        return result.Item || null;
    }

    static async deleteConnection(connectionId) {
        await docClient.send(new DeleteCommand({
            TableName: CONNECTIONS_TABLE,
            Key: { connectionId }
        }));
    }

    static async getAllConnections() {
        const result = await docClient.send(new ScanCommand({
            TableName: CONNECTIONS_TABLE
        }));
        
        return result.Items || [];
    }

    static async getAdminConnection() {
        const connections = await this.getAllConnections();
        return connections.find(conn => conn.isAdmin) || null;
    }

    static async getUserConnections() {
        const connections = await this.getAllConnections();
        return connections.filter(conn => !conn.isAdmin);
    }
}