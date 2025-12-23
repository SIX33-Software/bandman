import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "@/config/supabase";
import type { AuthUser, UserProfile } from "@/types";
import type { Session } from "@supabase/supabase-js";
import { baseApi } from "../api";

interface AuthState {
	user: AuthUser | null;
	profile: UserProfile | null;
	session: Session | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	isInitialized: boolean;
	error: string | null;
}

const initialState: AuthState = {
	user: null,
	profile: null,
	session: null,
	isAuthenticated: false,
	isLoading: false,
	isInitialized: false,
	error: null,
};

// Initialize auth state from Supabase session
export const initializeAuth = createAsyncThunk("auth/initialize", async (_, { rejectWithValue }) => {
	try {
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();

		if (error) {
			return rejectWithValue(error.message);
		}

		if (session?.user) {
			return {
				user: {
					id: session.user.id,
					email: session.user.email!,
				},
				session,
			};
		}

		return { user: null, session: null };
	} catch (_error) {
		return rejectWithValue("Failed to initialize auth");
	}
});

// Sign up with Supabase directly
export const signUpWithSupabase = createAsyncThunk(
	"auth/signUp",
	async (
		{ email, password, name, avatar_url }: { email: string; password: string; name: string; avatar_url?: string },
		{ rejectWithValue }
	) => {
		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						name,
						avatar_url,
					},
				},
			});

			if (error) {
				return rejectWithValue(error.message);
			}

			if (!data.user) {
				return rejectWithValue("Sign up failed - no user returned");
			}

			return {
				user: {
					id: data.user.id,
					email: data.user.email!,
				},
				session: data.session,
			};
		} catch (_error) {
			return rejectWithValue("Sign up failed");
		}
	}
);

// Sign in with Supabase directly
export const signInWithSupabase = createAsyncThunk(
	"auth/signIn",
	async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				return rejectWithValue(error.message);
			}

			if (!data.user || !data.session) {
				return rejectWithValue("Sign in failed - no session returned");
			}

			return {
				user: {
					id: data.user.id,
					email: data.user.email!,
				},
				session: data.session,
			};
		} catch (_error) {
			return rejectWithValue("Sign in failed");
		}
	}
);

// Sign out
export const signOut = createAsyncThunk("auth/signOut", async (_, { rejectWithValue }) => {
	try {
		const { error } = await supabase.auth.signOut();

		if (error) {
			return rejectWithValue(error.message);
		}

		await baseApi.util.resetApiState();

		return null;
	} catch (_error) {
		return rejectWithValue("Sign out failed");
	}
});

// Sign in with OAuth provider
export const signInWithOAuth = createAsyncThunk(
	"auth/signInWithOAuth",
	async (
		{ provider, redirectTo }: { provider: "google" | "github" | "discord"; redirectTo?: string },
		{ rejectWithValue }
	) => {
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: redirectTo || window.location.origin,
				},
			});

			if (error) {
				return rejectWithValue(error.message);
			}

			// OAuth redirects, so this won't actually return anything useful
			return null;
		} catch (_error) {
			return rejectWithValue("OAuth sign in failed");
		}
	}
);

// Reset password
export const resetPassword = createAsyncThunk(
	"auth/resetPassword",
	async ({ email }: { email: string }, { rejectWithValue }) => {
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`,
			});

			if (error) {
				return rejectWithValue(error.message);
			}

			return null;
		} catch (_error) {
			return rejectWithValue("Password reset failed");
		}
	}
);

// Update password
export const updatePassword = createAsyncThunk(
	"auth/updatePassword",
	async ({ password }: { password: string }, { rejectWithValue }) => {
		try {
			const { error } = await supabase.auth.updateUser({ password });

			if (error) {
				return rejectWithValue(error.message);
			}

			return null;
		} catch (_error) {
			return rejectWithValue("Password update failed");
		}
	}
);

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		// Set user profile (from /auth/me endpoint)
		setProfile: (state, action: PayloadAction<UserProfile | null>) => {
			state.profile = action.payload;
		},
		// Handle auth state changes from Supabase listener
		setAuthState: (state, action: PayloadAction<{ user: AuthUser | null; session: Session | null }>) => {
			state.user = action.payload.user;
			state.session = action.payload.session;
			state.isAuthenticated = !!action.payload.user;
			state.isInitialized = true;
		},
		// Clear any auth errors
		clearError: (state) => {
			state.error = null;
		},
		// Reset auth state
		resetAuth: (state) => {
			state.user = null;
			state.profile = null;
			state.session = null;
			state.isAuthenticated = false;
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		// Initialize auth
		builder
			.addCase(initializeAuth.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(initializeAuth.fulfilled, (state, action) => {
				state.isLoading = false;
				state.isInitialized = true;
				state.user = action.payload.user;
				state.session = action.payload.session;
				state.isAuthenticated = !!action.payload.user;
			})
			.addCase(initializeAuth.rejected, (state, action) => {
				state.isLoading = false;
				state.isInitialized = true;
				state.error = action.payload as string;
			});

		// Sign up
		builder
			.addCase(signUpWithSupabase.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(signUpWithSupabase.fulfilled, (state, action) => {
				state.isLoading = false;
				state.user = action.payload.user;
				state.session = action.payload.session;
				state.isAuthenticated = !!action.payload.session;
			})
			.addCase(signUpWithSupabase.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});

		// Sign in
		builder
			.addCase(signInWithSupabase.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(signInWithSupabase.fulfilled, (state, action) => {
				state.isLoading = false;
				state.user = action.payload.user;
				state.session = action.payload.session;
				state.isAuthenticated = true;
			})
			.addCase(signInWithSupabase.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});

		// Sign out
		builder
			.addCase(signOut.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(signOut.fulfilled, (state) => {
				state.isLoading = false;
				state.user = null;
				state.profile = null;
				state.session = null;
				state.isAuthenticated = false;
			})
			.addCase(signOut.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});

		// OAuth (just handle errors, redirect handles success)
		builder
			.addCase(signInWithOAuth.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(signInWithOAuth.fulfilled, (state) => {
				state.isLoading = false;
			})
			.addCase(signInWithOAuth.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});

		// Reset password
		builder
			.addCase(resetPassword.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(resetPassword.fulfilled, (state) => {
				state.isLoading = false;
			})
			.addCase(resetPassword.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});

		// Update password
		builder
			.addCase(updatePassword.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(updatePassword.fulfilled, (state) => {
				state.isLoading = false;
			})
			.addCase(updatePassword.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});
	},
});

export const { setProfile, setAuthState, clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;

