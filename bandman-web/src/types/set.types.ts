import { type BaseEntity } from "./api.types";
import { type Song } from "./song.types";

// ============ SET ============
export interface Set extends BaseEntity {
	band_id: string;
	name: string;
	description: string | null;
	created_by: string;
}

export type CreateSetRequest = Omit<Set, "id" | "created_at" | "updated_at">;
export type UpdateSetRequest = Partial<Omit<CreateSetRequest, "band_id" | "created_by">>;

// ============ SET SONG ============
export interface SetSong {
	id: string;
	set_id: string;
	song_id: string;
	position: number;
	note: string | null;
	added_at: string;
	song?: Song;
}

export interface AddSetSongRequest {
	song_id: string;
	position: number;
	note?: string;
}

export interface UpdateSetSongRequest {
	position?: number;
	note?: string;
}

export interface ReorderSetSongsRequest {
	songs: SongPosition[];
}

export interface SongPosition {
	song_id: string;
	position: number;
}

