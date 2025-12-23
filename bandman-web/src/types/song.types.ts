import type { BaseEntity } from "./api.types";

export interface Song extends BaseEntity {
  title: string;
  artist: string | null;
  duration_seconds: number | null;
  tempo_bpm: number | null;
  key: string | null;
  notes: string | null;
  lyrics: string | null;
  owner_id: string;
}

export type CreateSongRequest = Omit<Song, "id" | "created_at" | "updated_at">;
export type UpdateSongRequest = Partial<Omit<CreateSongRequest, "owner_id">>;

export interface SongSearchParams {
  q?: string;
  owner_id?: string;
  page?: number;
  limit?: number;
}
