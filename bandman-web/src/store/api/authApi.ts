import { baseApi } from "./baseApi";
import {
	type ApiResponse,
	type SignUpRequest,
	type SignInRequest,
	type SignUpResponse,
	type SignInResponse,
	type UserProfile,
} from "@/types";

export const authApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// Sign up a new user
		signUp: builder.mutation<ApiResponse<SignUpResponse>, SignUpRequest>({
			query: (credentials) => ({
				url: "/auth/signup",
				method: "POST",
				body: credentials,
			}),
			invalidatesTags: ["Auth"],
		}),

		// Sign in an existing user
		signIn: builder.mutation<ApiResponse<SignInResponse>, SignInRequest>({
			query: (credentials) => ({
				url: "/auth/signin",
				method: "POST",
				body: credentials,
			}),
			invalidatesTags: ["Auth"],
		}),

		// Get current user profile
		getMe: builder.query<ApiResponse<UserProfile>, void>({
			query: () => "/auth/me",
			providesTags: ["Auth"],
		}),
	}),
});

export const { useSignUpMutation, useSignInMutation, useGetMeQuery, useLazyGetMeQuery } = authApi;

