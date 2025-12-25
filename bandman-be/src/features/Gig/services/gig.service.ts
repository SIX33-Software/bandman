import { supabase } from '@/config/supabase';
import { BaseService } from '@/common/services';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types';
import { Gig, GigInsert, GigUpdate, GigStatus } from '../types';

class GigServiceClass extends BaseService<Gig, GigInsert, GigUpdate> {
  constructor() {
    super('gigs');
  }

  async findByBand(
    bandId: string,
    params: PaginationParams = {},
    status?: GigStatus,
  ): Promise<PaginatedResponse<Gig>> {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('band_id', bandId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('date', { ascending: true });

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
    params: PaginationParams = {},
  ): Promise<PaginatedResponse<Gig>> {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;
    const today = new Date().toISOString().split('T')[0];

    const { data, error, count } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('band_id', bandId)
      .eq('status', 'scheduled')
      .gte('date', today)
      .range(offset, offset + limit - 1)
      .order('date', { ascending: true });

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

  async findUpcomingForUser(
    userId: string,
    params: PaginationParams = {},
  ): Promise<PaginatedResponse<Gig & { bands: { name: string } }>> {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;
    const today = new Date().toISOString().split('T')[0];

    // 1. Get user's bands
    const { data: bandMembers, error: memberError } = await supabase
      .from('band_members')
      .select('band_id')
      .eq('user_id', userId);

    if (memberError) {
      return {
        success: false,
        message: memberError.message,
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    const bandIds = bandMembers?.map((bm) => bm.band_id) || [];

    if (bandIds.length === 0) {
      return {
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    // 2. Get gigs for those bands
    const { data, error, count } = await supabase
      .from(this.tableName)
      .select('*, bands(name)', { count: 'exact' })
      .in('band_id', bandIds)
      .eq('status', 'scheduled')
      .gte('date', today)
      .range(offset, offset + limit - 1)
      .order('date', { ascending: true });

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
      data: data as (Gig & { bands: { name: string } })[],
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
