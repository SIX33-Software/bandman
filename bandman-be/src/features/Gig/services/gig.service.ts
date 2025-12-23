import { supabase } from "@/config/supabase";
import { BaseService } from "@/common/services";
import { ApiResponse, PaginatedResponse, PaginationParams } from "@/types";
import { Gig, GigInsert, GigUpdate, GigStatus } from "../types";

class GigServiceClass extends BaseService<Gig, GigInsert, GigUpdate> {
  constructor() {
    super("gigs");
  }

  async findByBand(
    bandId: string,
    params: PaginationParams = {},
    status?: GigStatus
  ): Promise<PaginatedResponse<Gig>> {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    let query = supabase
      .from(this.tableName)
      .select("*", { count: "exact" })
      .eq("band_id", bandId);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order("date", { ascending: true });

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
      data: data as Gig[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findUpcoming(
    bandId: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<Gig>> {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;
    const today = new Date().toISOString().split("T")[0];

    const { data, error, count } = await supabase
      .from(this.tableName)
      .select("*", { count: "exact" })
      .eq("band_id", bandId)
      .eq("status", "scheduled")
      .gte("date", today)
      .range(offset, offset + limit - 1)
      .order("date", { ascending: true });

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
      data: data as Gig[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(id: string, status: GigStatus): Promise<ApiResponse<Gig>> {
    return this.update(id, { status });
  }

  async assignSet(id: string, setId: string | null): Promise<ApiResponse<Gig>> {
    return this.update(id, { set_id: setId });
  }
}

export const GigService = new GigServiceClass();
