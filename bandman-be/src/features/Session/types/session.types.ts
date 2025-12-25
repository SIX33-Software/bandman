import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';

// ============ ENTITY ============
export type SessionStatus = 'active' | 'paused' | 'ended';

export interface Session {
  id: string;
  band_id: string;
  set_id: string | null;
  name: string;
  current_song_id: string | null;
  current_song_position: number;
  status: SessionStatus;
  started_by: string;
  started_at: string;
  ended_at: string | null;
}

export type SessionInsert = Omit<Session, 'id' | 'started_at' | 'ended_at'>;
export type SessionUpdate = Partial<
  Pick<
    Session,
    | 'current_song_id'
    | 'current_song_position'
    | 'status'
    | 'set_id'
    | 'ended_at'
  >
>;

// ============ DTOs ============
export class CreateSessionDto
  implements
    Omit<
      SessionInsert,
      'current_song_id' | 'current_song_position' | 'status' | 'started_by'
    >
{
  @IsUUID()
  band_id!: string;

  @IsOptional()
  @IsUUID()
  set_id: string | null = null;

  @IsString()
  name!: string;
}

export class UpdateSessionDto {
  @IsOptional()
  @IsUUID()
  current_song_id?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  current_song_position?: number;

  @IsOptional()
  @IsEnum(['active', 'paused', 'ended'])
  status?: SessionStatus;

  @IsOptional()
  @IsUUID()
  set_id?: string | null;
}

export class ChangeSongDto {
  @IsUUID()
  song_id!: string;

  @IsInt()
  @Min(0)
  position!: number;
}

// ============ WebSocket Event Types ============
export type SessionEventType =
  | 'session:started'
  | 'session:ended'
  | 'session:paused'
  | 'session:resumed'
  | 'song:changed'
  | 'song:next'
  | 'song:previous'
  | 'member:joined'
  | 'member:left';

export interface SessionEvent<T = unknown> {
  type: SessionEventType;
  sessionId: string;
  bandId: string;
  payload: T;
  timestamp: string;
  triggeredBy: string;
}

export interface SongChangedPayload {
  songId: string | null;
  position: number;
  songTitle?: string;
}

export interface MemberPayload {
  userId: string;
  userName: string;
}

export interface SessionStatePayload {
  session: Session;
  currentSong?: {
    id: string;
    title: string;
    position: number;
  };
}
