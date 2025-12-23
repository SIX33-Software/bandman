import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  Gig,
  GigStatus,
  CreateGigRequest,
  UpdateGigRequest,
  GigStatusUpdateRequest,
  GigSetAssignRequest,
} from "@/types";

interface GigsByBandParams {
  bandId: string;
  status?: GigStatus;
  page?: number;
  limit?: number;
}

export const gigApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all gigs with pagination
    getGigs: builder.query<PaginatedResponse<Gig>, PaginationParams | void>({
      query: (params) => ({
        url: "/gigs",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Gig" as const, id })),
              { type: "Gig", id: "LIST" },
            ]
          : [{ type: "Gig", id: "LIST" }],
    }),

    // Get gigs by band with optional status filter
    getGigsByBand: builder.query<PaginatedResponse<Gig>, GigsByBandParams>({
      query: ({ bandId, status, page, limit }) => ({
        url: `/gigs/band/${bandId}`,
        params: { status, page, limit },
      }),
      providesTags: (result, _error, { bandId }) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Gig" as const, id })),
              { type: "Gig", id: `BAND_${bandId}` },
            ]
          : [{ type: "Gig", id: `BAND_${bandId}` }],
    }),

    // Get upcoming gigs for a band
    getUpcomingGigs: builder.query<PaginatedResponse<Gig>, { bandId: string; params?: PaginationParams }>({
      query: ({ bandId, params }) => ({
        url: `/gigs/band/${bandId}/upcoming`,
        params: params || {},
      }),
      providesTags: (result, _error, { bandId }) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Gig" as const, id })),
              { type: "Gig", id: `BAND_${bandId}_UPCOMING` },
            ]
          : [{ type: "Gig", id: `BAND_${bandId}_UPCOMING` }],
    }),

    // Get gig by ID
    getGigById: builder.query<ApiResponse<Gig>, string>({
      query: (id) => `/gigs/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Gig", id }],
    }),

    // Create a new gig
    createGig: builder.mutation<ApiResponse<Gig>, CreateGigRequest>({
      query: (body) => ({
        url: "/gigs",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Gig", id: "LIST" }],
    }),

    // Update an existing gig
    updateGig: builder.mutation<ApiResponse<Gig>, { id: string; data: UpdateGigRequest }>({
      query: ({ id, data }) => ({
        url: `/gigs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Gig", id },
        { type: "Gig", id: "LIST" },
      ],
    }),

    // Update gig status
    updateGigStatus: builder.mutation<ApiResponse<Gig>, { id: string; data: GigStatusUpdateRequest }>({
      query: ({ id, data }) => ({
        url: `/gigs/${id}/status`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Gig", id },
        { type: "Gig", id: "LIST" },
      ],
    }),

    // Assign set to gig
    assignSetToGig: builder.mutation<ApiResponse<Gig>, { id: string; data: GigSetAssignRequest }>({
      query: ({ id, data }) => ({
        url: `/gigs/${id}/set`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Gig", id },
        { type: "Gig", id: "LIST" },
      ],
    }),

    // Delete a gig
    deleteGig: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/gigs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Gig", id },
        { type: "Gig", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetGigsQuery,
  useLazyGetGigsQuery,
  useGetGigsByBandQuery,
  useLazyGetGigsByBandQuery,
  useGetUpcomingGigsQuery,
  useLazyGetUpcomingGigsQuery,
  useGetGigByIdQuery,
  useLazyGetGigByIdQuery,
  useCreateGigMutation,
  useUpdateGigMutation,
  useUpdateGigStatusMutation,
  useAssignSetToGigMutation,
  useDeleteGigMutation,
} = gigApi;
