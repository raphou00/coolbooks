"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Wifi, WifiOff, User, AlertCircle } from "lucide-react";
import ChatClient, { type ChatMessage } from "@/lib/chat";
import env from "@/lib/env";
import { name } from "@/config/girl";

export default function ChatUserComponent() {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<
        "connected" | "disconnected" | "reconnecting"
    >("disconnected");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [_isConnecting, setIsConnecting] = useState(false);

    const chatClientRef = useRef<ChatClient | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const client = new ChatClient(
                env.NEXT_PUBLIC_WEBSOCKET_URL,
                name,
                true
            );

            client.onMessage((message) => {
                setMessages((prev) => [...prev, message]);
            });

            client.onError((message) => {
                setMessages((prev) => [...prev, message]);
            });

            client.onStatusChange((status) => {
                setConnectionStatus(status);
                setIsConnected(status === "connected");
            });

            await client.connect();
            chatClientRef.current = client;

            const welcomeMessage: ChatMessage = {
                type: "message",
                from: "System",
                content: `Connected as ${name}. You can now chat with the admin.`,
                timestamp: new Date().toISOString(),
                messageId: Date.now().toString(),
            };
            setMessages([welcomeMessage]);
        } catch (error) {
            console.error("Connection failed:", error);
            alert(
                "Failed to connect. Please check your WebSocket URL and try again."
            );
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSendMessage = () => {
        if (!currentMessage.trim() || !chatClientRef.current) return;

        chatClientRef.current.sendMessage(currentMessage);

        const sentMessage: ChatMessage = {
            type: "message",
            from: name,
            to: "ye",
            content: currentMessage,
            timestamp: new Date().toISOString(),
            messageId: Date.now().toString(),
        };
        setMessages((prev) => [...prev, sentMessage]);
        setCurrentMessage("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleDisconnect = () => {
        if (chatClientRef.current) {
            chatClientRef.current.disconnect();
            chatClientRef.current = null;
        }
        setIsConnected(false);
        setConnectionStatus("disconnected");
        setMessages([]);
    };

    const getStatusIcon = () => {
        switch (connectionStatus) {
            case "connected":
                return <Wifi className="h-4 w-4 text-green-500" />;
            case "reconnecting":
                return (
                    <Wifi className="h-4 w-4 text-yellow-500 animate-pulse" />
                );
            default:
                return <WifiOff className="h-4 w-4 text-red-500" />;
        }
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case "connected":
                return "Connected";
            case "reconnecting":
                return "Reconnecting...";
            default:
                return "Disconnected";
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    useEffect(() => {
        handleConnect();
    });

    return (
        <div className="max-w-2xl mx-auto h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <User className="h-6 w-6 text-blue-500" />
                    <div>
                        <h1 className="font-semibold text-gray-800">
                            Chat with Admin
                        </h1>
                        <p className="text-sm text-gray-600">
                            Logged in as {name}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        {getStatusIcon()}
                        <span className="text-sm font-medium text-gray-700">
                            {getStatusText()}
                        </span>
                    </div>
                    <button
                        onClick={handleDisconnect}
                        className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                        Disconnect
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.messageId}
                        className={`flex ${message.from === name ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.type === "error" ?
                                    "bg-red-100 text-red-800 border border-red-200"
                                : message.from === name ?
                                    "bg-blue-500 text-white"
                                : message.from === "System" ?
                                    "bg-gray-100 text-gray-600 border border-gray-200"
                                :   "bg-white text-gray-800 border border-gray-200"
                            }`}
                        >
                            {message.from !== name &&
                                message.from !== "System" && (
                                    <div className="text-xs font-medium mb-1 opacity-75">
                                        {message.from}
                                    </div>
                                )}

                            <div className="break-words">{message.content}</div>

                            <div
                                className={`text-xs mt-1 ${
                                    message.from === name ?
                                        "text-blue-100"
                                    :   "text-gray-500"
                                }`}
                            >
                                {formatTime(message.timestamp)}
                            </div>
                        </div>
                    </div>
                ))}

                {!isConnected && connectionStatus === "reconnecting" && (
                    <div className="flex justify-center">
                        <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">
                                Attempting to reconnect...
                            </span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t bg-white p-4">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message to admin..."
                        disabled={!isConnected}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!isConnected || !currentMessage.trim()}
                        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>

                {!isConnected && (
                    <p className="text-sm text-gray-500 mt-2">
                        You must be connected to send messages
                    </p>
                )}
            </div>
        </div>
    );
}
