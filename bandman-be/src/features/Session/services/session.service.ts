import { supabase } from "@/config/supabase";
import { ApiResponse } from "@/types";
import {
  Session,
  SessionInsert,
  SessionUpdate,
  SessionStatus,
  SessionEvent,
  SongChangedPayload,
} from "../types";
import { SetSongWithDetails } from "@/features/Set/services";

class SessionServiceClass {
  private tableName = "sessions";

  private async assertOwner(
    sessionId: string,
    userId: string
  ): Promise<ApiResponse<Session>> {
    if (!userId) {
      return { success: false, message: "Missing userId" };
    }

    const session = await this.findById(sessionId);
    if (!session.success || !session.data) {
      return {
        success: false,
        message: session.message || "Session not found",
      };
    }

    if (session.data.status === "ended") {
      return { success: false, message: "Session has ended" };
    }

    if (session.data.started_by !== userId) {
      return {
        success: false,
        message: "Only the session creator can control this session",
      };
    }

    return { success: true, data: session.data };
  }

  async canControl(
    sessionId: string,
    userId: string
  ): Promise<ApiResponse<Session>> {
    return this.assertOwner(sessionId, userId);
  }

  async findById(id: string): Promise<ApiResponse<Session>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data: data as Session };
  }

  async findActiveByBand(bandId: string): Promise<ApiResponse<Session | null>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("band_id", bandId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data: data as Session | null };
  }

  async create(payload: SessionInsert): Promise<ApiResponse<Session>> {
    // First check if there's already an active session for this band
    const existing = await this.findActiveByBand(payload.band_id);
    if (existing.success && existing.data) {
      return {
        success: false,
        message: "An active session already exists for this band",
      };
    }

    const sessionData = {
      ...payload,
      current_song_position: payload.current_song_position || 0,
      status: "active" as const,
    };

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(sessionData as any)
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data: data as Session };
  }

  async update(
    id: string,
    payload: SessionUpdate
  ): Promise<ApiResponse<Session>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(payload as any)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data: data as Session };
  }

  async endSession(id: string): Promise<ApiResponse<Session>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data: data as Session };
  }

  async pauseSession(id: string): Promise<ApiResponse<Session>> {
    return this.update(id, { status: "paused" });
  }

  async resumeSession(id: string): Promise<ApiResponse<Session>> {
    return this.update(id, { status: "active" });
  }

  async changeSong(
    id: string,
    songId: string | null,
    position: number
  ): Promise<ApiResponse<Session>> {
    return this.update(id, {
      current_song_id: songId,
      current_song_position: position,
    });
  }

  async getSetSongs(setId: string): Promise<ApiResponse<SetSongWithDetails[]>> {
    const { data, error } = await supabase
      .from("set_songs")
      .select(
        `
				*,
				song:songs (*)
			`
      )
      .eq("set_id", setId)
      .order("position", { ascending: true });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data: data as SetSongWithDetails[] };
  }

  async nextSong(
    id: string
  ): Promise<ApiResponse<Session & { nextSong?: SongChangedPayload }>> {
    const session = await this.findById(id);
    if (!session.success || !session.data) {
      return { success: false, message: "Session not found" };
    }

    if (!session.data.set_id) {
      return { success: false, message: "No set assigned to session" };
    }

    const songs = await this.getSetSongs(session.data.set_id);
    if (!songs.success || !songs.data) {
      return { success: false, message: "Failed to get set songs" };
    }

    const nextPosition = session.data.current_song_position + 1;
    const nextSong = songs.data.find((s) => s.position === nextPosition);

    if (!nextSong) {
      return { success: false, message: "No more songs in set" };
    }

    const updated = await this.changeSong(id, nextSong.song_id, nextPosition);
    if (!updated.success) {
      return updated;
    }

    return {
      ...updated,
      data: {
        ...updated.data!,
        nextSong: {
          songId: nextSong.song_id,
          position: nextPosition,
          songTitle: nextSong.song.title,
        },
      },
    };
  }

  async previousSong(
    id: string
  ): Promise<ApiResponse<Session & { previousSong?: SongChangedPayload }>> {
    const session = await this.findById(id);
    if (!session.success || !session.data) {
      return { success: false, message: "Session not found" };
    }

    if (!session.data.set_id) {
      return { success: false, message: "No set assigned to session" };
    }

    const prevPosition = session.data.current_song_position - 1;
    if (prevPosition < 0) {
      return { success: false, message: "Already at the first song" };
    }

    const songs = await this.getSetSongs(session.data.set_id);
    if (!songs.success || !songs.data) {
      return { success: false, message: "Failed to get set songs" };
    }

    const prevSong = songs.data.find((s) => s.position === prevPosition);

    if (!prevSong) {
      return { success: false, message: "Previous song not found" };
    }

    const updated = await this.changeSong(id, prevSong.song_id, prevPosition);
    if (!updated.success) {
      return updated;
    }

    return {
      ...updated,
      data: {
        ...updated.data!,
        previousSong: {
          songId: prevSong.song_id,
          position: prevPosition,
          songTitle: prevSong.song.title,
        },
      },
    };
  }

  // Helper to create WebSocket events
  createEvent<T>(
    type: SessionEvent<T>["type"],
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
}

export const SessionService = new SessionServiceClass();
