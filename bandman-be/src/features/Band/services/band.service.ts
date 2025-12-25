import { getAuthenticatedClient, supabase } from '@/config/supabase';
import { BaseService } from '@/common/services';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types';
import {
  Band,
  BandInsert,
  BandUpdate,
  BandMember,
  BandMemberInsert,
  BandMemberUpdate,
  BandSong,
  BandSongInsert,
} from '../types';
import { Song } from '@/features/Song/types';
import { User } from '@/features/User/types';

class BandServiceClass extends BaseService<Band, BandInsert, BandUpdate> {
  constructor() {
    super('bands');
  }

  async findByUser(
    userId: string,
    params: PaginationParams = {},
    accessToken?: string,
  ): Promise<PaginatedResponse<Band>> {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;
    const db = accessToken ? getAuthenticatedClient(accessToken) : supabase;

    const [memberRes, ownedRes] = await Promise.all([
      db
        .from('band_members')
        .select(
          `
						band:bands (*),
						joined_at
					`,
          { count: 'exact' },
        )
        .eq('user_id', userId)
        .range(offset, offset + limit - 1)
        .order('joined_at', { ascending: false }),
      db
        .from('bands')
        .select('*', { count: 'exact' })
        .eq('created_by', userId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false }),
    ]);

    if (memberRes.error) {
      return {
        success: false,
        message: memberRes.error.message,
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    if (ownedRes.error) {
      return {
        success: false,
        message: ownedRes.error.message,
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const memberBands = ((memberRes.data as any[]) || [])
      .map((row) => row.band as Band)
      .filter(Boolean);
    const ownedBands = (ownedRes.data as Band[]) || [];

    const mergedById = new Map<string, Band>();
    [...memberBands, ...ownedBands].forEach((band) => {
      mergedById.set(band.id, band);
    });

    const merged = Array.from(mergedById.values()).sort((a, b) => {
      const aDate = new Date(a.created_at).getTime();
      const bDate = new Date(b.created_at).getTime();
      return bDate - aDate;
    });

    const total = merged.length;
    const start = offset;
    const end = offset + limit;

    return {
      success: true,
      data: merged.slice(start, end),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ============ BAND MEMBERS ============
  async getMembers(
    bandId: string,
  ): Promise<ApiResponse<(BandMember & { user: User })[]>> {
    const { data, error } = await supabase
      .from('band_members')
      .select(
        `
				*,
				user:users (*)
			`,
      )
      .eq('band_id', bandId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data: data as (BandMember & { user: User })[] };
  }

  async addMember(
    bandId: string,
    payload: Omit<BandMemberInsert, 'band_id'>,
    accessToken?: string,
  ): Promise<ApiResponse<BandMember>> {
    const db = accessToken ? getAuthenticatedClient(accessToken) : supabase;
    const insertData = { ...payload, band_id: bandId };
    const { data, error } = await db
      .from('band_members')
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data: data as BandMember };
  }

  async updateMember(
    bandId: string,
    userId: string,
    payload: BandMemberUpdate,
  ): Promise<ApiResponse<BandMember>> {
    const { data, error } = await supabase
      .from('band_members')
      .update(payload as any)
      .eq('band_id', bandId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data: data as BandMember };
  }

  async removeMember(bandId: string, userId: string): Promise<ApiResponse> {
    const { error } = await supabase
      .from('band_members')
      .delete()
      .eq('band_id', bandId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Member removed successfully' };
  }

  // ============ BAND SONGS (Song List - NOT Sets) ============
  async getSongs(
    bandId: string,
    params: PaginationParams = {},
  ): Promise<PaginatedResponse<Song>> {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('band_songs')
      .select(
        `
				*,
				song:songs (*)
			`,
        { count: 'exact' },
      )
      .eq('band_id', bandId)
      .range(offset, offset + limit - 1)
      .order('added_at', { ascending: false });

    if (error) {
      return {
        success: false,
        message: error.message,
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    const songs = data?.map((item: { song: Song }) => item.song) || [];
    const total = count || 0;

    return {
      success: true,
      data: songs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addSong(
    bandId: string,
    payload: Omit<BandSongInsert, 'band_id'>,
  ): Promise<ApiResponse<BandSong>> {
    const insertData = { ...payload, band_id: bandId };
    const { data, error } = await supabase
      .from('band_songs')
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data: data as BandSong };
  }

  async removeSong(bandId: string, songId: string): Promise<ApiResponse> {
    const { error } = await supabase
      .from('band_songs')
      .delete()
      .eq('band_id', bandId)
      .eq('song_id', songId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Song removed from band' };
  }
}

export const BandService = new BandServiceClass();
