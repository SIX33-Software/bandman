import type { BaseEntity } from "./api.types";

export interface User extends BaseEntity {
  email: string;
  name: string;
  avatar_url: string | null;
}

export type CreateUserRequest = Omit<User, "id" | "created_at" | "updated_at">;
export type UpdateUserRequest = Partial<CreateUserRequest>;
