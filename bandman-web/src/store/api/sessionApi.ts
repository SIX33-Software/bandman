import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  Session,
  CreateSessionRequest,
  UpdateSessionRequest,
  ChangeSongRequest,
} from "@/types";

export const sessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get session by ID
    getSessionById: builder.query<ApiResponse<Session>, string>({
      query: (id) => `/sessions/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Session", id }],
    }),

    // Get active session for a band
    getActiveSessionByBand: builder.query<ApiResponse<Session>, string>({
      query: (bandId) => `/sessions/band/${bandId}/active`,
      providesTags: (_result, _error, bandId) => [
        { type: "Session", id: `BAND_${bandId}_ACTIVE` },
      ],
    }),

    // Create a new session
    createSession: builder.mutation<ApiResponse<Session>, CreateSessionRequest>({
      query: (body) => ({
        url: "/sessions",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { band_id }) => [
        { type: "Session", id: `BAND_${band_id}_ACTIVE` },
      ],
    }),

    // Update session
    updateSession: builder.mutation<ApiResponse<Session>, { id: string; data: UpdateSessionRequest }>({
      query: ({ id, data }) => ({
        url: `/sessions/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Session", id }],
    }),

    // End session
    endSession: builder.mutation<ApiResponse<Session>, string>({
      query: (id) => ({
        url: `/sessions/${id}/end`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Session", id }],
    }),

    // Pause session
    pauseSession: builder.mutation<ApiResponse<Session>, string>({
      query: (id) => ({
        url: `/sessions/${id}/pause`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Session", id }],
    }),

    // Resume session
    resumeSession: builder.mutation<ApiResponse<Session>, string>({
      query: (id) => ({
        url: `/sessions/${id}/resume`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Session", id }],
    }),

    // Change song in session
    changeSong: builder.mutation<ApiResponse<Session>, { id: string; data: ChangeSongRequest }>({
      query: ({ id, data }) => ({
        url: `/sessions/${id}/song`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Session", id }],
    }),

    // Go to next song
    nextSong: builder.mutation<ApiResponse<Session>, string>({
      query: (id) => ({
        url: `/sessions/${id}/next`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Session", id }],
    }),

    // Go to previous song
    previousSong: builder.mutation<ApiResponse<Session>, string>({
      query: (id) => ({
        url: `/sessions/${id}/previous`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Session", id }],
    }),
  }),
});

export const {
  useGetSessionByIdQuery,
  useLazyGetSessionByIdQuery,
  useGetActiveSessionByBandQuery,
  useLazyGetActiveSessionByBandQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useEndSessionMutation,
  usePauseSessionMutation,
  useResumeSessionMutation,
  useChangeSongMutation,
  useNextSongMutation,
  usePreviousSongMutation,
} = sessionApi;
