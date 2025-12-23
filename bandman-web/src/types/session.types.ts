// ============ SESSION ============
export type SessionStatus = "active" | "paused" | "ended";

export interface Session {
  id: string;
  band_id: string;
  set_id: string | null;
  name: string;
  current_song_id: string | null;
  current_song_position: number;
  status: SessionStatus;
  started_by: string;
  started_at: string;
  ended_at: string | null;
}

export interface CreateSessionRequest {
  band_id: string;
  set_id?: string | null;
  name: string;
}

export interface UpdateSessionRequest {
  current_song_id?: string | null;
  current_song_position?: number;
  status?: SessionStatus;
  set_id?: string | null;
}

export interface ChangeSongRequest {
  song_id: string;
  position: number;
}

// ============ WebSocket Event Types ============
export type SessionEventType =
  | "session:started"
  | "session:ended"
  | "session:paused"
  | "session:resumed"
  | "song:changed"
  | "song:next"
  | "song:previous"
  | "member:joined"
  | "member:left";

export interface SessionEvent<T = unknown> {
  type: SessionEventType;
  sessionId: string;
  bandId: string;
  payload: T;
  timestamp: string;
  triggeredBy: string;
}

export interface SongChangedPayload {
  songId: string | null;
  position: number;
  songTitle?: string;
}

export interface MemberPayload {
  userId: string;
  userName: string;
}

export interface SessionStatePayload {
  session: Session;
  currentSong?: {
    id: string;
    title: string;
    position: number;
  };
}
