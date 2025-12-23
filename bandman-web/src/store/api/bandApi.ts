import { baseApi } from "./baseApi";
import type {
	ApiResponse,
	PaginatedResponse,
	PaginationParams,
	Band,
	CreateBandRequest,
	UpdateBandRequest,
	BandMemberWithUser,
	AddBandMemberRequest,
	UpdateBandMemberRequest,
	BandSong,
	AddBandSongRequest,
	Song,
} from "@/types";

export const bandApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// ============ BAND CRUD ============

		// Get all bands with pagination
		getBands: builder.query<PaginatedResponse<Band>, PaginationParams | void>({
			query: (params) => ({
				url: "/bands",
				params: params || {},
			}),
			providesTags: () => ["Band", { type: "Band", id: "LIST" }],
		}),

		// Get band by ID
		getBandById: builder.query<ApiResponse<Band>, string>({
			query: (id) => `/bands/${id}`,
			providesTags: (_result, _error, id) => [{ type: "Band", id }],
		}),

		// Create a new band
		createBand: builder.mutation<ApiResponse<Band>, CreateBandRequest>({
			query: (body) => ({
				url: "/bands",
				method: "POST",
				body,
			}),
			invalidatesTags: [{ type: "Band", id: "LIST" }],
		}),

		// Update an existing band
		updateBand: builder.mutation<ApiResponse<Band>, { id: string; data: UpdateBandRequest }>({
			query: ({ id, data }) => ({
				url: `/bands/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: "Band", id },
				{ type: "Band", id: "LIST" },
			],
		}),

		// Delete a band
		deleteBand: builder.mutation<ApiResponse<void>, string>({
			query: (id) => ({
				url: `/bands/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: "Band", id },
				{ type: "Band", id: "LIST" },
			],
		}),

		// ============ BAND MEMBERS ============

		// Get band members with user info
		getBandMembers: builder.query<ApiResponse<BandMemberWithUser[]>, string>({
			query: (bandId) => `/bands/${bandId}/members`,
			providesTags: (_result, _error, bandId) => [{ type: "BandMember", id: `BAND_${bandId}` }],
		}),

		// Add a member to band
		addBandMember: builder.mutation<ApiResponse<BandMemberWithUser>, { bandId: string; data: AddBandMemberRequest }>({
			query: ({ bandId, data }) => ({
				url: `/bands/${bandId}/members`,
				method: "POST",
				body: data,
			}),
			invalidatesTags: (_result, _error, { bandId }) => [{ type: "BandMember", id: `BAND_${bandId}` }],
		}),

		// Update band member role
		updateBandMember: builder.mutation<
			ApiResponse<BandMemberWithUser>,
			{ bandId: string; userId: string; data: UpdateBandMemberRequest }
		>({
			query: ({ bandId, userId, data }) => ({
				url: `/bands/${bandId}/members/${userId}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: (_result, _error, { bandId }) => [{ type: "BandMember", id: `BAND_${bandId}` }],
		}),

		// Remove member from band
		removeBandMember: builder.mutation<ApiResponse<void>, { bandId: string; userId: string }>({
			query: ({ bandId, userId }) => ({
				url: `/bands/${bandId}/members/${userId}`,
				method: "DELETE",
			}),
			invalidatesTags: (_result, _error, { bandId }) => [{ type: "BandMember", id: `BAND_${bandId}` }],
		}),

		// ============ BAND SONGS ============

		// Get band songs (returns actual Song objects, not BandSong)
		getBandSongs: builder.query<PaginatedResponse<Song>, { bandId: string; params?: PaginationParams }>({
			query: ({ bandId, params }) => ({
				url: `/bands/${bandId}/songs`,
				params: params || {},
			}),
			providesTags: (_result, _error, { bandId }) => [{ type: "BandSong", id: `BAND_${bandId}` }],
		}),

		// Add song to band
		addBandSong: builder.mutation<ApiResponse<BandSong>, { bandId: string; data: AddBandSongRequest }>({
			query: ({ bandId, data }) => ({
				url: `/bands/${bandId}/songs`,
				method: "POST",
				body: data,
			}),
			invalidatesTags: (_result, _error, { bandId }) => [{ type: "BandSong", id: `BAND_${bandId}` }],
		}),

		// Remove song from band
		removeBandSong: builder.mutation<ApiResponse<void>, { bandId: string; songId: string }>({
			query: ({ bandId, songId }) => ({
				url: `/bands/${bandId}/songs/${songId}`,
				method: "DELETE",
			}),
			invalidatesTags: (_result, _error, { bandId }) => [{ type: "BandSong", id: `BAND_${bandId}` }],
		}),
	}),
});

export const {
	// Band CRUD
	useGetBandsQuery,
	useLazyGetBandsQuery,
	useGetBandByIdQuery,
	useLazyGetBandByIdQuery,
	useCreateBandMutation,
	useUpdateBandMutation,
	useDeleteBandMutation,
	// Band Members
	useGetBandMembersQuery,
	useLazyGetBandMembersQuery,
	useAddBandMemberMutation,
	useUpdateBandMemberMutation,
	useRemoveBandMemberMutation,
	// Band Songs
	useGetBandSongsQuery,
	useLazyGetBandSongsQuery,
	useAddBandSongMutation,
	useRemoveBandSongMutation,
} = bandApi;

