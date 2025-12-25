import { IsString, IsOptional, IsUUID, IsEnum, IsDateString, IsNumber } from "class-validator";
import { BaseEntity } from "@/types";

// ============ ENTITY ============
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
	price: number | null;
}

export type GigInsert = Omit<Gig, "id" | "created_at" | "updated_at">;
export type GigUpdate = Partial<Omit<GigInsert, "band_id" | "created_by">>;

// ============ DTOs ============
export class CreateGigDto implements Omit<GigInsert, "created_by"> {
	@IsUUID()
	band_id!: string;

	@IsString()
	name!: string;

	@IsOptional()
	@IsString()
	venue: string | null = null;

	@IsOptional()
	@IsString()
	address: string | null = null;

	@IsDateString()
	date!: string;

	@IsOptional()
	@IsString()
	start_time: string | null = null;

	@IsOptional()
	@IsString()
	end_time: string | null = null;

	@IsOptional()
	@IsString()
	notes: string | null = null;

	@IsOptional()
	@IsUUID()
	set_id: string | null = null;

	@IsEnum(["scheduled", "completed", "cancelled"])
	status: GigStatus = "scheduled";

	@IsOptional()
	@IsNumber()
	price: number | null = null;
}

export class UpdateGigDto implements GigUpdate {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	venue?: string | null;

	@IsOptional()
	@IsString()
	address?: string | null;

	@IsOptional()
	@IsDateString()
	date?: string;

	@IsOptional()
	@IsString()
	start_time?: string | null;

	@IsOptional()
	@IsString()
	end_time?: string | null;

	@IsOptional()
	@IsString()
	notes?: string | null;

	@IsOptional()
	@IsUUID()
	set_id?: string | null;

	@IsOptional()
	@IsEnum(["scheduled", "completed", "cancelled"])
	status?: GigStatus;

	@IsOptional()
	@IsNumber()
	price?: number | null;
}

