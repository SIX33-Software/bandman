import {
	createApi,
	fetchBaseQuery,
	type BaseQueryFn,
	type FetchArgs,
	type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "@/config/supabase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Create a custom base query that adds auth headers
const baseQuery = fetchBaseQuery({
	baseUrl: API_BASE_URL,
	prepareHeaders: async (headers) => {
		const token = await getAccessToken();
		if (token) {
			headers.set("Authorization", `Bearer ${token}`);
		}
		headers.set("Content-Type", "application/json");
		return headers;
	},
});

// Wrapper for handling errors and token refresh
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
	args,
	api,
	extraOptions
) => {
	const result = await baseQuery(args, api, extraOptions);

	// Handle 401 errors - could add token refresh logic here
	if (result.error && result.error.status === 401) {
		// Token expired or invalid - the auth slice should handle logout
		// You could dispatch a logout action here if needed
	}

	return result;
};

// Base API - all feature APIs will inject endpoints into this
export const baseApi = createApi({
	reducerPath: "api",
	baseQuery: baseQueryWithReauth,
	tagTypes: ["Auth", "User", "Band", "BandMember", "BandSong", "Song", "Set", "SetSong", "Gig", "Session"],
	endpoints: () => ({}),
});

