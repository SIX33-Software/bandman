import { supabase } from '@/config/supabase';
import { BaseService } from '@/common/services';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types';
import { Song, SongInsert, SongUpdate } from '../types';

class SongServiceClass extends BaseService<Song, SongInsert, SongUpdate> {
  constructor() {
    super('songs');
  }

  async findByOwner(
    ownerId: string,
    params: PaginationParams = {},
  ): Promise<PaginatedResponse<Song>> {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('owner_id', ownerId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

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
      data: data as Song[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async search(
    query: string,
    ownerId?: string,
    params: PaginationParams = {},
  ): Promise<PaginatedResponse<Song>> {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    let dbQuery = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .or(`title.ilike.%${query}%,artist.ilike.%${query}%`);

    if (ownerId) {
      dbQuery = dbQuery.eq('owner_id', ownerId);
    }

    const { data, error, count } = await dbQuery
      .range(offset, offset + limit - 1)
      .order('title', { ascending: true });

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
      data: data as Song[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const SongService = new SongServiceClass();
