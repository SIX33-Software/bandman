import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { BaseEntity } from '@/types';

// ============ ENTITY ============
export interface User extends BaseEntity {
  email: string;
  name: string;
  avatar_url: string | null;
}

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type UserUpdate = Partial<UserInsert>;

// ============ DTOs ============
export class CreateUserDto implements UserInsert {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  avatar_url: string | null = null;
}

export class UpdateUserDto implements Partial<UserInsert> {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string | null;
}
