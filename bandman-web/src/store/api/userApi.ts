import { baseApi } from "./baseApi";
import type {
	ApiResponse,
	PaginatedResponse,
	PaginationParams,
	User,
	CreateUserRequest,
	UpdateUserRequest,
} from "@/types";

export interface SearchUsersParams extends PaginationParams {
	q: string;
}

export const userApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// Get all users with pagination
		getUsers: builder.query<PaginatedResponse<User>, PaginationParams | void>({
			query: (params) => ({
				url: "/users",
				params: params || {},
			}),
			providesTags: (result) =>
				result?.data
					? [...result.data.map(({ id }) => ({ type: "User" as const, id })), { type: "User", id: "LIST" }]
					: [{ type: "User", id: "LIST" }],
		}),

		// Search users by email or display name
		searchUsers: builder.query<PaginatedResponse<User>, SearchUsersParams>({
			query: ({ q, ...params }) => ({
				url: "/users/search",
				params: { q, ...params },
			}),
			providesTags: [{ type: "User", id: "SEARCH" }],
		}),

		// Get user by ID
		getUserById: builder.query<ApiResponse<User>, string>({
			query: (id) => `/users/${id}`,
			providesTags: (_result, _error, id) => [{ type: "User", id }],
		}),

		// Create a new user
		createUser: builder.mutation<ApiResponse<User>, CreateUserRequest>({
			query: (body) => ({
				url: "/users",
				method: "POST",
				body,
			}),
			invalidatesTags: [{ type: "User", id: "LIST" }],
		}),

		// Update an existing user
		updateUser: builder.mutation<ApiResponse<User>, { id: string; data: UpdateUserRequest }>({
			query: ({ id, data }) => ({
				url: `/users/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: "User", id },
				{ type: "User", id: "LIST" },
			],
		}),

		// Delete a user
		deleteUser: builder.mutation<ApiResponse<void>, string>({
			query: (id) => ({
				url: `/users/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: "User", id },
				{ type: "User", id: "LIST" },
			],
		}),
	}),
});

export const {
	useGetUsersQuery,
	useLazyGetUsersQuery,
	useSearchUsersQuery,
	useLazySearchUsersQuery,
	useGetUserByIdQuery,
	useLazyGetUserByIdQuery,
	useCreateUserMutation,
	useUpdateUserMutation,
	useDeleteUserMutation,
} = userApi;

