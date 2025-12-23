import { supabase } from "@/config/supabase";
import { ApiResponse, PaginatedResponse, PaginationParams } from "@/types";

// Base service with common CRUD operations
export abstract class BaseService<TRow, TInsert, TUpdate> {
	protected tableName: string;

	constructor(tableName: string) {
		this.tableName = tableName;
	}

	async findById(id: string): Promise<ApiResponse<TRow>> {
		const { data, error } = await supabase.from(this.tableName).select("*").eq("id", id).single();

		if (error) {
			return { success: false, message: error.message };
		}

		return { success: true, data: data as TRow };
	}

	async findAll(
		params: PaginationParams = {},
		filters: Record<string, unknown> = {}
	): Promise<PaginatedResponse<TRow>> {
		const { page = 1, limit = 20 } = params;
		const offset = (page - 1) * limit;

		let query = supabase.from(this.tableName).select("*", { count: "exact" });

		// Apply filters
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				query = query.eq(key, value);
			}
		});

		const { data, error, count } = await query
			.range(offset, offset + limit - 1)
			.order("created_at", { ascending: false });

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
			data: data as TRow[],
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	async create(payload: TInsert): Promise<ApiResponse<TRow>> {
		const { data, error } = await supabase
			.from(this.tableName)
			.insert(payload as never)
			.select()
			.single();

		if (error) {
			return { success: false, message: error.message };
		}

		return { success: true, data: data as TRow };
	}

	async update(id: string, payload: TUpdate): Promise<ApiResponse<TRow>> {
		const { data, error } = await supabase
			.from(this.tableName)
			.update(payload as never)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			return { success: false, message: error.message };
		}

		return { success: true, data: data as TRow };
	}

	async delete(id: string): Promise<ApiResponse> {
		const { error } = await supabase.from(this.tableName).delete().eq("id", id);

		if (error) {
			return { success: false, message: error.message };
		}

		return { success: true, message: "Deleted successfully" };
	}
}

