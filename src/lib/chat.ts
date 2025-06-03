export type ChatMessage = {
    type: "message" | "userJoined" | "userLeft" | "error";
    from: string;
    to?: string;
    content: string;
    timestamp: string;
    messageId: string;
};

export default class ChatClient {
    private ws: WebSocket | null = null;
    private messageHandlers: Map<string, (message: ChatMessage) => void> =
        new Map();
    private statusHandlers: ((
        status: "connected" | "disconnected" | "reconnecting"
    ) => void)[] = [];
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    constructor(
        private wsUrl: string,
        private username: string,
        private isAdmin: boolean = false
    ) {}

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            const url = `${this.wsUrl}?username=${encodeURIComponent(this.username)}&isAdmin=${this.isAdmin}`;
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                this.reconnectAttempts = 0;
                this.notifyStatusHandlers("connected");
                resolve();
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error("Failed to parse message:", error);
                }
            };

            this.ws.onclose = () => {
                this.notifyStatusHandlers("disconnected");
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.notifyStatusHandlers("reconnecting");
                    setTimeout(
                        () => this.reconnect(),
                        1000 * Math.pow(2, this.reconnectAttempts)
                    );
                }
            };

            this.ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                reject(error);
            };
        });
    }

    private reconnect(): void {
        this.reconnectAttempts++;
        this.connect().catch(console.error);
    }

    sendMessage(content: string): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not connected");
            return;
        }

        const message = {
            action: "sendMessage",
            content,
        };

        this.ws.send(JSON.stringify(message));
    }

    onMessage(handler: (message: ChatMessage) => void): void {
        this.messageHandlers.set("message", handler);
    }

    onError(handler: (message: ChatMessage) => void): void {
        this.messageHandlers.set("error", handler);
    }

    onStatusChange(
        handler: (status: "connected" | "disconnected" | "reconnecting") => void
    ): void {
        this.statusHandlers.push(handler);
    }

    private handleMessage(message: ChatMessage): void {
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
            handler(message);
        }
    }

    private notifyStatusHandlers(
        status: "connected" | "disconnected" | "reconnecting"
    ): void {
        this.statusHandlers.forEach((handler) => handler(status));
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
