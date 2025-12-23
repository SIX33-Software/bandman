import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  Set,
  CreateSetRequest,
  UpdateSetRequest,
  SetSong,
  AddSetSongRequest,
  UpdateSetSongRequest,
  ReorderSetSongsRequest,
} from "@/types";

export const setApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ============ SET CRUD ============

    // Get all sets with pagination
    getSets: builder.query<PaginatedResponse<Set>, PaginationParams | void>({
      query: (params) => ({
        url: "/sets",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Set" as const, id })),
              { type: "Set", id: "LIST" },
            ]
          : [{ type: "Set", id: "LIST" }],
    }),

    // Get sets by band
    getSetsByBand: builder.query<PaginatedResponse<Set>, { bandId: string; params?: PaginationParams }>({
      query: ({ bandId, params }) => ({
        url: `/sets/band/${bandId}`,
        params: params || {},
      }),
      providesTags: (result, _error, { bandId }) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Set" as const, id })),
              { type: "Set", id: `BAND_${bandId}` },
            ]
          : [{ type: "Set", id: `BAND_${bandId}` }],
    }),

    // Get set by ID
    getSetById: builder.query<ApiResponse<Set>, string>({
      query: (id) => `/sets/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Set", id }],
    }),

    // Create a new set
    createSet: builder.mutation<ApiResponse<Set>, CreateSetRequest>({
      query: (body) => ({
        url: "/sets",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Set", id: "LIST" }],
    }),

    // Update an existing set
    updateSet: builder.mutation<ApiResponse<Set>, { id: string; data: UpdateSetRequest }>({
      query: ({ id, data }) => ({
        url: `/sets/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Set", id },
        { type: "Set", id: "LIST" },
      ],
    }),

    // Delete a set
    deleteSet: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/sets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Set", id },
        { type: "Set", id: "LIST" },
      ],
    }),

    // ============ SET SONGS ============

    // Get songs in a set
    getSetSongs: builder.query<ApiResponse<SetSong[]>, string>({
      query: (setId) => `/sets/${setId}/songs`,
      providesTags: (_result, _error, setId) => [{ type: "SetSong", id: `SET_${setId}` }],
    }),

    // Add song to set
    addSetSong: builder.mutation<ApiResponse<SetSong>, { setId: string; data: AddSetSongRequest }>({
      query: ({ setId, data }) => ({
        url: `/sets/${setId}/songs`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { setId }) => [
        { type: "SetSong", id: `SET_${setId}` },
      ],
    }),

    // Update song in set
    updateSetSong: builder.mutation<
      ApiResponse<SetSong>,
      { setId: string; songId: string; data: UpdateSetSongRequest }
    >({
      query: ({ setId, songId, data }) => ({
        url: `/sets/${setId}/songs/${songId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { setId }) => [
        { type: "SetSong", id: `SET_${setId}` },
      ],
    }),

    // Reorder songs in set
    reorderSetSongs: builder.mutation<ApiResponse<SetSong[]>, { setId: string; data: ReorderSetSongsRequest }>({
      query: ({ setId, data }) => ({
        url: `/sets/${setId}/songs/reorder`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { setId }) => [
        { type: "SetSong", id: `SET_${setId}` },
      ],
    }),

    // Remove song from set
    removeSetSong: builder.mutation<ApiResponse<void>, { setId: string; songId: string }>({
      query: ({ setId, songId }) => ({
        url: `/sets/${setId}/songs/${songId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { setId }) => [
        { type: "SetSong", id: `SET_${setId}` },
      ],
    }),
  }),
});

export const {
  // Set CRUD
  useGetSetsQuery,
  useLazyGetSetsQuery,
  useGetSetsByBandQuery,
  useLazyGetSetsByBandQuery,
  useGetSetByIdQuery,
  useLazyGetSetByIdQuery,
  useCreateSetMutation,
  useUpdateSetMutation,
  useDeleteSetMutation,
  // Set Songs
  useGetSetSongsQuery,
  useLazyGetSetSongsQuery,
  useAddSetSongMutation,
  useUpdateSetSongMutation,
  useReorderSetSongsMutation,
  useRemoveSetSongMutation,
} = setApi;
