import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BaseEntity } from '@/types';

// ============ ENTITY ============
export interface Set extends BaseEntity {
  band_id: string;
  name: string;
  description: string | null;
  created_by: string;
}

export type SetInsert = Omit<Set, 'id' | 'created_at' | 'updated_at'>;
export type SetUpdate = Partial<Omit<SetInsert, 'band_id' | 'created_by'>>;

// ============ SET SONG ============
export interface SetSong {
  id: string;
  set_id: string;
  song_id: string;
  position: number;
  note: string | null;
  added_at: string;
}

export type SetSongInsert = Omit<SetSong, 'id' | 'added_at' | 'note'> & {
  note?: string | null;
};
export type SetSongUpdate = Partial<Pick<SetSong, 'position' | 'note'>>;

// ============ DTOs ============
export class CreateSetDto implements SetInsert {
  @IsUUID()
  band_id!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description: string | null = null;

  @IsUUID()
  created_by!: string;
}

export class UpdateSetDto implements SetUpdate {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;
}

export class AddSetSongDto {
  @IsUUID()
  song_id!: string;

  @IsInt()
  @Min(0)
  position!: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateSetSongDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class ReorderSetSongsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SongPositionDto)
  songs!: SongPositionDto[];
}

export class SongPositionDto {
  @IsUUID()
  song_id!: string;

  @IsInt()
  @Min(0)
  position!: number;
}
