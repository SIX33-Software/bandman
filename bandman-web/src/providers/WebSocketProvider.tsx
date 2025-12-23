import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/config/supabase";
import { useAuth } from "@/hooks/useAuth";

interface WebSocketContextType {
	socket: Socket | null;
	isConnected: boolean;
	joinSession: (sessionId: string) => void;
	leaveSession: (sessionId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const { user } = useAuth();

	useEffect(() => {
		if (!user) {
			if (socket) {
				socket.disconnect();
				setSocket(null);
				setIsConnected(false);
			}
			return;
		}

		const initSocket = async () => {
			const token = await getAccessToken();
			if (!token) return;

			const socketInstance = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:3000", {
				auth: {
					token,
				},
				transports: ["websocket"],
			});

			socketInstance.on("connect", () => {
				console.log("WebSocket connected");
				setIsConnected(true);
			});

			socketInstance.on("disconnect", () => {
				console.log("WebSocket disconnected");
				setIsConnected(false);
			});

			socketInstance.on("connect_error", (err) => {
				console.error("WebSocket connection error:", err);
			});

			setSocket(socketInstance);
		};

		initSocket();

		return () => {
			if (socket) {
				socket.disconnect();
			}
		};
	}, [user]);

	const joinSession = useCallback(
		(sessionId: string) => {
			if (socket && isConnected) {
				socket.emit("session:join", { sessionId });
			}
		},
		[socket, isConnected]
	);

	const leaveSession = useCallback(
		(sessionId: string) => {
			if (socket && isConnected) {
				socket.emit("session:leave", { sessionId });
			}
		},
		[socket, isConnected]
	);

	return (
		<WebSocketContext.Provider value={{ socket, isConnected, joinSession, leaveSession }}>
			{children}
		</WebSocketContext.Provider>
	);
};

export const useWebSocket = () => {
	const context = useContext(WebSocketContext);
	if (context === undefined) {
		throw new Error("useWebSocket must be used within a WebSocketProvider");
	}
	return context;
};

