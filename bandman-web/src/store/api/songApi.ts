import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  Song,
  CreateSongRequest,
  UpdateSongRequest,
  SongSearchParams,
} from "@/types";

export const songApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all songs with pagination
    getSongs: builder.query<PaginatedResponse<Song>, PaginationParams | void>({
      query: (params) => ({
        url: "/songs",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Song" as const, id })),
              { type: "Song", id: "LIST" },
            ]
          : [{ type: "Song", id: "LIST" }],
    }),

    // Search songs
    searchSongs: builder.query<PaginatedResponse<Song>, SongSearchParams>({
      query: (params) => ({
        url: "/songs/search",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Song" as const, id })),
              { type: "Song", id: "SEARCH" },
            ]
          : [{ type: "Song", id: "SEARCH" }],
    }),

    // Get songs by owner
    getSongsByOwner: builder.query<PaginatedResponse<Song>, { ownerId: string; params?: PaginationParams }>({
      query: ({ ownerId, params }) => ({
        url: `/songs/owner/${ownerId}`,
        params: params || {},
      }),
      providesTags: (result, _error, { ownerId }) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Song" as const, id })),
              { type: "Song", id: `OWNER_${ownerId}` },
            ]
          : [{ type: "Song", id: `OWNER_${ownerId}` }],
    }),

    // Get song by ID
    getSongById: builder.query<ApiResponse<Song>, string>({
      query: (id) => `/songs/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Song", id }],
    }),

    // Create a new song
    createSong: builder.mutation<ApiResponse<Song>, CreateSongRequest>({
      query: (body) => ({
        url: "/songs",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Song", id: "LIST" }],
    }),

    // Update an existing song
    updateSong: builder.mutation<ApiResponse<Song>, { id: string; data: UpdateSongRequest }>({
      query: ({ id, data }) => ({
        url: `/songs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Song", id },
        { type: "Song", id: "LIST" },
      ],
    }),

    // Delete a song
    deleteSong: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/songs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Song", id },
        { type: "Song", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSongsQuery,
  useLazyGetSongsQuery,
  useSearchSongsQuery,
  useLazySearchSongsQuery,
  useGetSongsByOwnerQuery,
  useLazyGetSongsByOwnerQuery,
  useGetSongByIdQuery,
  useLazyGetSongByIdQuery,
  useCreateSongMutation,
  useUpdateSongMutation,
  useDeleteSongMutation,
} = songApi;
