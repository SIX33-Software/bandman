import { supabase } from "@/config/supabase";
import { BaseService } from "@/common/services";
import { ApiResponse, PaginatedResponse, PaginationParams } from "@/types";
import { Set, SetInsert, SetUpdate, SetSong, SetSongInsert, SongPositionDto, SetSongUpdate } from "../types";
import { Song } from "@/features/Song/types";

// Extended type for set songs with song details
export interface SetSongWithDetails extends SetSong {
	song: Song;
}

class SetServiceClass extends BaseService<Set, SetInsert, SetUpdate> {
	constructor() {
		super("sets");
	}

	async findByBand(bandId: string, params: PaginationParams = {}): Promise<PaginatedResponse<Set>> {
		const { page = 1, limit = 20 } = params;
		const offset = (page - 1) * limit;

		const { data, error, count } = await supabase
			.from(this.tableName)
			.select("*", { count: "exact" })
			.eq("band_id", bandId)
			.range(offset, offset + limit - 1)
			.order("created_at", { ascending: false });

		if (error) {
			return {
				success: false,
				message: error.message,
				pagination: { page, limit, total: 0, totalPages: 0 },
			};
		}

		const total = count || 0;
		return {
			success: true,
			data: data as Set[],
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	// ============ SET SONGS ============
	async getSongs(setId: string): Promise<ApiResponse<SetSongWithDetails[]>> {
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

	async addSong(setId: string, payload: Omit<SetSongInsert, "set_id">): Promise<ApiResponse<SetSong>> {
		const insertData = { ...payload, set_id: setId };
		const { data, error } = await supabase
			.from("set_songs")
			.insert(insertData as any)
			.select()
			.single();

		if (error) {
			return { success: false, message: error.message };
		}

		return { success: true, data: data as SetSong };
	}

	async updateSong(setId: string, songId: string, payload: SetSongUpdate): Promise<ApiResponse<SetSong>> {
		const { data, error } = await supabase
			.from("set_songs")
			.update(payload as any)
			.eq("set_id", setId)
			.eq("song_id", songId)
			.select()
			.single();

		if (error) {
			return { success: false, message: error.message };
		}

		return { success: true, data: data as SetSong };
	}

	async reorderSongs(setId: string, songs: SongPositionDto[]): Promise<ApiResponse> {
		// Update all positions in a transaction-like manner
		const updates = songs.map((song) =>
			supabase
				.from("set_songs")
				.update({ position: song.position } as any)
				.eq("set_id", setId)
				.eq("song_id", song.song_id)
		);

		const results = await Promise.all(updates);
		const hasError = results.some((r) => r.error);

		if (hasError) {
			return { success: false, message: "Failed to reorder songs" };
		}

		return { success: true, message: "Songs reordered successfully" };
	}

	async removeSong(setId: string, songId: string): Promise<ApiResponse> {
		const { error } = await supabase.from("set_songs").delete().eq("set_id", setId).eq("song_id", songId);

		if (error) {
			return { success: false, message: error.message };
		}

		return { success: true, message: "Song removed from set" };
	}
}

export const SetService = new SetServiceClass();

