import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { SessionService } from "@/features/Session/services";
import { AuthService } from "@/features/Auth/services";
import {
  SessionEvent,
  SessionEventType,
  SongChangedPayload,
  MemberPayload,
  SessionStatePayload,
} from "@/features/Session/types";

export class WebSocketManager {
  private io: Server;
  private sessionRooms: Map<string, Set<string>> = new Map(); // sessionId -> Set of socket ids

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on("connection", (socket: Socket) => {
      void this.handleConnection(socket);
    });
  }

  private async handleConnection(socket: Socket): Promise<void> {
    console.log(`Client connected: ${socket.id}`);

    const token = this.getTokenFromSocket(socket);
    if (!token) {
      socket.emit("error", { message: "Missing auth token" });
      socket.disconnect(true);
      return;
    }

    const auth = await AuthService.getUserFromAccessToken(token);
    if (!auth.success || !auth.data) {
      socket.emit("error", { message: auth.message || "Unauthorized" });
      socket.disconnect(true);
      return;
    }

    socket.data.userId = auth.data.id;
    socket.data.userEmail = auth.data.email;

    // Join a session room
    socket.on(
      "session:join",
      async (data: { sessionId: string; userName?: string }) => {
        await this.handleJoinSession(socket, data);
      }
    );

    // Leave a session room
    socket.on(
      "session:leave",
      (data: { sessionId: string; userName?: string }) => {
        this.handleLeaveSession(socket, data);
      }
    );

    // Session control events (only session owner can trigger)
    socket.on(
      "session:control",
      async (data: {
        sessionId: string;
        action: "pause" | "resume" | "end" | "next" | "previous" | "changeSong";
        songId?: string;
        position?: number;
      }) => {
        await this.handleSessionControl(socket, data);
      }
    );

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      this.handleDisconnect(socket);
    });
  }

  private getTokenFromSocket(socket: Socket): string | null {
    const authToken = (socket.handshake.auth as any)?.token as
      | string
      | undefined;
    if (authToken) return authToken;

    const header = socket.handshake.headers?.authorization as
      | string
      | undefined;
    if (header && header.startsWith("Bearer ")) {
      return header.slice("Bearer ".length).trim();
    }

    return null;
  }

  private async handleJoinSession(
    socket: Socket,
    data: { sessionId: string; userName?: string }
  ): Promise<void> {
    const userId = socket.data.userId as string | undefined;
    const userName =
      data.userName || (socket.data.userEmail as string | undefined) || "";
    const { sessionId } = data;

    if (!userId) {
      socket.emit("error", { message: "Unauthorized" });
      return;
    }

    // Verify session exists and is active
    const session = await SessionService.findById(sessionId);
    if (!session.success || !session.data || session.data.status === "ended") {
      socket.emit("error", { message: "Session not found or has ended" });
      return;
    }

    // Join the socket room
    socket.join(sessionId);

    // Track room membership
    if (!this.sessionRooms.has(sessionId)) {
      this.sessionRooms.set(sessionId, new Set());
    }
    this.sessionRooms.get(sessionId)!.add(socket.id);

    // Store user info on socket
    socket.data.sessionId = sessionId;
    socket.data.userName = userName;
    socket.data.bandId = session.data.band_id;

    // Emit current session state to the joining user
    const statePayload: SessionStatePayload = {
      session: session.data,
    };
    socket.emit("session:state", statePayload);

    // Notify others in the session
    const event = this.createEvent<MemberPayload>(
      "member:joined",
      sessionId,
      session.data.band_id,
      { userId, userName },
      userId
    );
    socket.to(sessionId).emit("session:event", event);
  }

  private handleLeaveSession(
    socket: Socket,
    data: { sessionId: string; userName?: string }
  ): void {
    const { sessionId } = data;
    const userId = socket.data.userId as string | undefined;
    const userName =
      data.userName || (socket.data.userName as string | undefined) || "";
    const bandId = (socket.data.bandId as string | undefined) || "";

    socket.leave(sessionId);
    this.sessionRooms.get(sessionId)?.delete(socket.id);

    // Notify others
    if (userId && userName) {
      const event = this.createEvent<MemberPayload>(
        "member:left",
        sessionId,
        bandId,
        { userId, userName },
        userId
      );
      socket.to(sessionId).emit("session:event", event);
    }

    // Cleanup room tracking if empty
    const room = this.sessionRooms.get(sessionId);
    if (room && room.size === 0) {
      this.sessionRooms.delete(sessionId);
    }
  }

  private async handleSessionControl(
    socket: Socket,
    data: {
      sessionId: string;
      action: "pause" | "resume" | "end" | "next" | "previous" | "changeSong";
      songId?: string;
      position?: number;
    }
  ): Promise<void> {
    const { sessionId, action, songId, position } = data;
    const userId = socket.data.userId as string | undefined;

    if (!userId) {
      socket.emit("error", { message: "Unauthorized" });
      return;
    }

    const auth = await SessionService.canControl(sessionId, userId);
    if (!auth.success || !auth.data) {
      socket.emit("error", { message: auth.message || "Not authorized" });
      return;
    }
    const bandId = auth.data.band_id;

    let result;
    let eventType: SessionEventType;
    let payload: SongChangedPayload | Record<string, never> = {};

    switch (action) {
      case "pause":
        result = await SessionService.pauseSession(sessionId);
        eventType = "session:paused";
        break;
      case "resume":
        result = await SessionService.resumeSession(sessionId);
        eventType = "session:resumed";
        break;
      case "end":
        result = await SessionService.endSession(sessionId);
        eventType = "session:ended";
        break;
      case "next":
        result = await SessionService.nextSong(sessionId);
        eventType = "song:next";
        if (result.success && result.data?.nextSong) {
          payload = result.data.nextSong;
        }
        break;
      case "previous":
        result = await SessionService.previousSong(sessionId);
        eventType = "song:previous";
        if (result.success && result.data?.previousSong) {
          payload = result.data.previousSong;
        }
        break;
      case "changeSong":
        if (!songId || position === undefined) {
          socket.emit("error", { message: "songId and position required" });
          return;
        }
        result = await SessionService.changeSong(sessionId, songId, position);
        eventType = "song:changed";
        payload = { songId, position, songTitle: "" };
        break;
      default:
        socket.emit("error", { message: "Unknown action" });
        return;
    }

    if (!result.success) {
      socket.emit("error", { message: result.message });
      return;
    }

    // Broadcast to all in the session including sender
    const event = this.createEvent(
      eventType,
      sessionId,
      bandId,
      payload,
      userId
    );
    this.io.to(sessionId).emit("session:event", event);
  }

  private handleDisconnect(socket: Socket): void {
    const { sessionId, userId, userName } = socket.data;
    if (sessionId) {
      this.sessionRooms.get(sessionId)?.delete(socket.id);
      const bandId = (socket.data.bandId as string | undefined) || "";

      if (userId && userName) {
        const event = this.createEvent<MemberPayload>(
          "member:left",
          sessionId,
          bandId,
          { userId, userName },
          userId
        );
        socket.to(sessionId).emit("session:event", event);
      }

      // Cleanup room tracking if empty
      const room = this.sessionRooms.get(sessionId);
      if (room && room.size === 0) {
        this.sessionRooms.delete(sessionId);
      }
    }
  }

  private createEvent<T>(
    type: SessionEventType,
    sessionId: string,
    bandId: string,
    payload: T,
    triggeredBy: string
  ): SessionEvent<T> {
    return {
      type,
      sessionId,
      bandId,
      payload,
      timestamp: new Date().toISOString(),
      triggeredBy,
    };
  }

  // Public method to broadcast from REST endpoints if needed
  public broadcast(sessionId: string, event: SessionEvent<unknown>): void {
    this.io.to(sessionId).emit("session:event", event);
  }

  public getIO(): Server {
    return this.io;
  }
}

let wsManager: WebSocketManager | null = null;

export const initializeWebSocket = (
  httpServer: HttpServer
): WebSocketManager => {
  wsManager = new WebSocketManager(httpServer);
  return wsManager;
};

export const getWebSocketManager = (): WebSocketManager | null => wsManager;
