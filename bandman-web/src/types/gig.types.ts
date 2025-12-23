import { type BaseEntity } from "./api.types";

export type GigStatus = "scheduled" | "completed" | "cancelled";

export interface Gig extends BaseEntity {
  band_id: string;
  name: string;
  venue: string | null;
  address: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  set_id: string | null;
  status: GigStatus;
  created_by: string;
}

export type CreateGigRequest = Omit<Gig, "id" | "created_at" | "updated_at">;
export type UpdateGigRequest = Partial<Omit<CreateGigRequest, "band_id" | "created_by">>;

export interface GigStatusUpdateRequest {
  status: GigStatus;
}

export interface GigSetAssignRequest {
  set_id: string | null;
}
