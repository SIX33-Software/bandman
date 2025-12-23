import { supabaseAnon, requireSupabaseAdmin } from "@/config/supabase";
import { ApiResponse } from "@/types";
import { SignInDto, SignUpDto, AuthUser } from "../types";
import { User } from "@/features/User/types/user.dto";

class AuthServiceClass {
	async signUp(payload: SignUpDto): Promise<
		ApiResponse<{
			user: AuthUser;
			session: unknown;
		}>
	> {
		const { data, error } = await supabaseAnon.auth.signUp({
			email: payload.email,
			password: payload.password,
			options: {
				data: {
					name: payload.name,
					avatar_url: payload.avatar_url,
				},
			},
		});

		if (error) {
			return { success: false, message: error.message };
		}

		if (!data.user || !data.user.email) {
			return {
				success: false,
				message: "Supabase signup did not return a user",
			};
		}

		const userId = data.user.id;

		// Create or upsert public user profile
		const admin = requireSupabaseAdmin();
		const profile: Partial<User> = {
			id: userId,
			email: data.user.email,
			name: payload.name,
			avatar_url: payload.avatar_url ?? null,
		};

		const { error: profileError } = await admin.from("users").upsert(profile as any, { onConflict: "id" });

		if (profileError) {
			return { success: false, message: profileError.message };
		}

		return {
			success: true,
			data: {
				user: { id: userId, email: data.user.email },
				session: data.session,
			},
		};
	}

	async signIn(payload: SignInDto): Promise<
		ApiResponse<{
			user: AuthUser;
			access_token: string;
			session: unknown;
		}>
	> {
		const { data, error } = await supabaseAnon.auth.signInWithPassword({
			email: payload.email,
			password: payload.password,
		});

		if (error) {
			return { success: false, message: error.message };
		}

		if (!data.user || !data.user.email || !data.session?.access_token) {
			return {
				success: false,
				message: "Supabase signin did not return a valid session",
			};
		}

		// Ensure profile exists (for users created elsewhere)
		try {
			const admin = requireSupabaseAdmin();
			const { data: existing } = await admin.from("users").select("id").eq("id", data.user.id).maybeSingle();

			if (!existing) {
				await admin.from("users").insert({
					id: data.user.id,
					email: data.user.email,
					name: (data.user.user_metadata?.name as string | undefined) ?? data.user.email,
					avatar_url: (data.user.user_metadata?.avatar_url as string | undefined) ?? null,
				} as any);
			}
		} catch {
			// If admin key isn't configured, we still allow sign-in
		}

		return {
			success: true,
			data: {
				user: { id: data.user.id, email: data.user.email },
				access_token: data.session.access_token,
				session: data.session,
			},
		};
	}

	async getUserFromAccessToken(accessToken: string): Promise<ApiResponse<AuthUser>> {
		const { data, error } = await supabaseAnon.auth.getUser(accessToken);
		if (error) {
			return { success: false, message: error.message };
		}
		if (!data.user || !data.user.email) {
			return { success: false, message: "Invalid token" };
		}
		return {
			success: true,
			data: { id: data.user.id, email: data.user.email },
		};
	}

	async getProfile(userId: string): Promise<ApiResponse<User>> {
		const admin = requireSupabaseAdmin();
		const { data, error } = await admin.from("users").select("*").eq("id", userId).maybeSingle();

		if (error) {
			return {
				success: false,
				message: error.message || "Failed to load profile (ensure users.id is unique/primary key)",
			};
		}

		if (!data) {
			return {
				success: false,
				message:
					"User profile not found. Either run the DB SQL (public.users) or sign up again after setting SUPABASE_SERVICE_ROLE_KEY.",
			};
		}

		return { success: true, data: data as User };
	}

	async getOrCreateProfile(user: AuthUser, accessToken?: string): Promise<ApiResponse<User>> {
		const admin = requireSupabaseAdmin();
		const existing = await admin.from("users").select("*").eq("id", user.id).maybeSingle();

		if (existing.error) {
			return {
				success: false,
				message: existing.error.message || "Failed to load profile (ensure users.id is unique/primary key)",
			};
		}

		if (existing.data) {
			return { success: true, data: existing.data as User };
		}

		// Fetch user metadata from Supabase Auth to get name/avatar
		let name = user.email;
		let avatar_url: string | null = null;

		if (accessToken) {
			const { data: authData } = await supabaseAnon.auth.getUser(accessToken);
			if (authData?.user?.user_metadata) {
				name = (authData.user.user_metadata.name as string) || user.email;
				avatar_url = (authData.user.user_metadata.avatar_url as string) || null;
			}
		}

		const upserted = await admin
			.from("users")
			.upsert(
				{
					id: user.id,
					email: user.email,
					name,
					avatar_url,
				} as any,
				{ onConflict: "id" }
			)
			.select("*")
			.single();

		if (upserted.error) {
			return { success: false, message: upserted.error.message };
		}

		return { success: true, data: upserted.data as User };
	}
}

export const AuthService = new AuthServiceClass();

