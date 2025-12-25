import {
  IsString,
  IsOptional,
  MinLength,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { BaseEntity } from '@/types';

// ============ ENTITY ============
export interface Band extends BaseEntity {
  name: string;
  description: string | null;
  image_url: string | null;
  created_by: string;
}

export type BandInsert = Omit<Band, 'id' | 'created_at' | 'updated_at'>;
export type BandUpdate = Partial<Omit<BandInsert, 'created_by'>>;

// ============ BAND MEMBER ============
export type BandRole = 'owner' | 'admin' | 'member';

export interface BandMember {
  id: string;
  band_id: string;
  user_id: string;
  role: BandRole;
  joined_at: string;
}

export type BandMemberInsert = Omit<BandMember, 'id' | 'joined_at'>;
export type BandMemberUpdate = Partial<Pick<BandMember, 'role'>>;

// ============ BAND SONG (Song list for a band - NOT a set) ============
export interface BandSong {
  id: string;
  band_id: string;
  song_id: string;
  added_by: string;
  added_at: string;
}

export type BandSongInsert = Omit<BandSong, 'id' | 'added_at'>;

// ============ DTOs ============
export class CreateBandDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description: string | null = null;

  @IsOptional()
  @IsString()
  image_url: string | null = null;
}

export class UpdateBandDto implements BandUpdate {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  image_url?: string | null;
}

export class AddBandMemberDto {
  @IsUUID()
  user_id!: string;

  @IsEnum(['owner', 'admin', 'member'])
  role!: BandRole;
}

export class UpdateBandMemberDto {
  @IsEnum(['owner', 'admin', 'member'])
  role!: BandRole;
}

export class AddBandSongDto {
  @IsUUID()
  song_id!: string;

  @IsUUID()
  added_by!: string;
}
