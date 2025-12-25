import { IsString, IsOptional, IsInt, Min, Max, IsUUID } from 'class-validator';
import { BaseEntity } from '@/types';

// ============ ENTITY ============
export interface Song extends BaseEntity {
  title: string;
  artist: string | null;
  duration_seconds: number | null;
  tempo_bpm: number | null;
  key: string | null;
  notes: string | null;
  lyrics: string | null;
  owner_id: string;
}

export type SongInsert = Omit<Song, 'id' | 'created_at' | 'updated_at'>;
export type SongUpdate = Partial<Omit<SongInsert, 'owner_id'>>;

// ============ DTOs ============
export class CreateSongDto implements SongInsert {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  artist: string | null = null;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration_seconds: number | null = null;

  @IsOptional()
  @IsInt()
  @Min(20)
  @Max(300)
  tempo_bpm: number | null = null;

  @IsOptional()
  @IsString()
  key: string | null = null;

  @IsOptional()
  @IsString()
  notes: string | null = null;

  @IsOptional()
  @IsString()
  lyrics: string | null = null;

  @IsUUID()
  owner_id!: string;
}

export class UpdateSongDto implements SongUpdate {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  artist?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration_seconds?: number | null;

  @IsOptional()
  @IsInt()
  @Min(20)
  @Max(300)
  tempo_bpm?: number | null;

  @IsOptional()
  @IsString()
  key?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  lyrics?: string | null;
}
