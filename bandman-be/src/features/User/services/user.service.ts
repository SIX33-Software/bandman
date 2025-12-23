import { getAuthenticatedClient, supabase } from "@/config/supabase";
import { BaseService } from "@/common/services";
import { ApiResponse, PaginatedResponse, PaginationParams } from "@/types";
import { User, UserInsert, UserUpdate } from "../types/user.dto";
import { Band } from "@/features/Band/types";

class UserServiceClass extends BaseService<User, UserInsert, UserUpdate> {
	constructor() {
		super("users");
	}

	async findByEmail(email: string): Promise<ApiResponse<User>> {
		const { data, error } = await supabase.from(this.tableName).select("*").eq("email", email).single();

		if (error) {
			return { success: false, message: error.message };
		}

		return { success: true, data: data as User };
	}

	async searchUsers(query: string, params: PaginationParams = {}): Promise<PaginatedResponse<User>> {
		const { page = 1, limit = 20 } = params;
		const offset = (page - 1) * limit;

		// Search by email or name (case-insensitive)
		const { data, error, count } = await supabase
			.from(this.tableName)
			.select("*", { count: "exact" })
			.or(`email.ilike.%${query}%,name.ilike.%${query}%`)
			.range(offset, offset + limit - 1)
			.order("name", { ascending: true });

		if (error) {
			return {
				success: false,
				message: error.message,
				pagination: { page, limit, total: 0, totalPages: 0 },
			};
		}

		const total = count || 0;
		return {
			success: true,
			data: data as User[],
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	async getUserBands(userId: string, accessToken?: string): Promise<ApiResponse<Band[]>> {
		const db = accessToken ? getAuthenticatedClient(accessToken) : supabase;
		const { data, error } = await db
			.from("band_members")
			.select(
				`
				band:bands (*)
			`
			)
			.eq("user_id", userId);

		if (error) {
			return { success: false, message: error.message };
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const bands = (data as any[])?.map((item: any) => item.band as Band).filter(Boolean) || [];
		return { success: true, data: bands };
	}
}

export const UserService = new UserServiceClass();

