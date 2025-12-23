import { useCallback } from "react";
import {
	useAppDispatch,
	useAppSelector,
	signUpWithSupabase,
	signInWithSupabase,
	signOut,
	signInWithOAuth,
	resetPassword,
	updatePassword,
	clearError,
	setProfile,
} from "@/store";
import { useGetMeQuery, useLazyGetMeQuery } from "@/store/api/authApi";
import type { UserProfile } from "@/types";

export function useAuth() {
	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);

	// Get profile query (auto-fetches when authenticated)
	const {
		data: profileData,
		isLoading: isLoadingProfile,
		refetch: refetchProfile,
	} = useGetMeQuery(undefined, {
		skip: !auth.isAuthenticated,
	});

	// Lazy profile query for manual fetching
	const [fetchProfile] = useLazyGetMeQuery();

	// Sign up handler
	const handleSignUp = useCallback(
		async (email: string, password: string, name: string, avatar_url?: string) => {
			const result = await dispatch(signUpWithSupabase({ email, password, name, avatar_url }));
			if (signUpWithSupabase.fulfilled.match(result)) {
				// Fetch user profile after successful signup
				const profileResult = await fetchProfile();
				if (profileResult.data?.success && profileResult.data.data) {
					dispatch(setProfile(profileResult.data.data));
				}
			}
			return result;
		},
		[dispatch, fetchProfile]
	);

	// Sign in handler
	const handleSignIn = useCallback(
		async (email: string, password: string) => {
			const result = await dispatch(signInWithSupabase({ email, password }));
			if (signInWithSupabase.fulfilled.match(result)) {
				// Fetch user profile after successful signin
				const profileResult = await fetchProfile();
				if (profileResult.data?.success && profileResult.data.data) {
					dispatch(setProfile(profileResult.data.data));
				}
			}
			return result;
		},
		[dispatch, fetchProfile]
	);

	// Sign out handler
	const handleSignOut = useCallback(async () => {
		return dispatch(signOut());
	}, [dispatch]);

	// OAuth sign in handler
	const handleOAuthSignIn = useCallback(
		(provider: "google" | "github" | "discord", redirectTo?: string) => {
			return dispatch(signInWithOAuth({ provider, redirectTo }));
		},
		[dispatch]
	);

	// Reset password handler
	const handleResetPassword = useCallback(
		(email: string) => {
			return dispatch(resetPassword({ email }));
		},
		[dispatch]
	);

	// Update password handler
	const handleUpdatePassword = useCallback(
		(password: string) => {
			return dispatch(updatePassword({ password }));
		},
		[dispatch]
	);

	// Clear error handler
	const handleClearError = useCallback(() => {
		dispatch(clearError());
	}, [dispatch]);

	// Update profile in state
	const updateProfile = useCallback(
		(profile: UserProfile | null) => {
			dispatch(setProfile(profile));
		},
		[dispatch]
	);

	// Combine profile from state and query
	const profile = auth.profile || profileData?.data || null;

	return {
		// State
		user: auth.user,
		profile,
		session: auth.session,
		isAuthenticated: auth.isAuthenticated,
		isLoading: auth.isLoading || isLoadingProfile,
		isInitialized: auth.isInitialized,
		error: auth.error,

		// Actions
		signUp: handleSignUp,
		signIn: handleSignIn,
		signOut: handleSignOut,
		signInWithOAuth: handleOAuthSignIn,
		resetPassword: handleResetPassword,
		updatePassword: handleUpdatePassword,
		clearError: handleClearError,
		updateProfile,
		refetchProfile,
	};
}

