import { type BaseEntity } from "./api.types";
import type { User } from "./user.types";

// ============ BAND ============
export interface Band extends BaseEntity {
	name: string;
	description: string | null;
	image_url: string | null;
	created_by: string;
}

export type CreateBandRequest = Omit<Band, "id" | "created_at" | "updated_at" | "created_by">;
export type UpdateBandRequest = Partial<Omit<CreateBandRequest, "created_by">>;

// ============ BAND MEMBER ============
export type BandRole = "owner" | "admin" | "member";

export interface BandMember {
	id: string;
	band_id: string;
	user_id: string;
	role: BandRole;
	joined_at: string;
}

export interface BandMemberWithUser extends BandMember {
	user: User;
}

export interface AddBandMemberRequest {
	user_id: string;
	role: BandRole;
}

export interface UpdateBandMemberRequest {
	role: BandRole;
}

// ============ BAND SONG ============
export interface BandSong {
	id: string;
	band_id: string;
	song_id: string;
	added_by: string;
	added_at: string;
}

export interface AddBandSongRequest {
	song_id: string;
	added_by: string;
}

