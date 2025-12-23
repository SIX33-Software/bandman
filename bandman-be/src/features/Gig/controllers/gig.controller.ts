import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Param,
	Body,
	QueryParams,
	QueryParam,
	HttpCode,
	JsonController,
} from "routing-controllers";
import { GigService } from "../services";
import { CreateGigDto, UpdateGigDto, GigStatus } from "../types";
import { PaginationDto } from "@/common/dto";

@JsonController("/gigs")
export class GigController {
	@Get("/")
	async getAll(@QueryParams() query: PaginationDto) {
		return GigService.findAll(query);
	}

	@Get("/band/:bandId")
	async getByBand(
		@Param("bandId") bandId: string,
		@QueryParam("status") status: GigStatus,
		@QueryParams() query: PaginationDto
	) {
		return GigService.findByBand(bandId, query, status);
	}

	@Get("/band/:bandId/upcoming")
	async getUpcoming(@Param("bandId") bandId: string, @QueryParams() query: PaginationDto) {
		return GigService.findUpcoming(bandId, query);
	}

	@Get("/:id")
	async getById(@Param("id") id: string) {
		return GigService.findById(id);
	}

	@Post("/")
	@HttpCode(201)
	async create(@Body() body: CreateGigDto) {
		return GigService.create(body);
	}

	@Put("/:id")
	async update(@Param("id") id: string, @Body() body: UpdateGigDto) {
		return GigService.update(id, body);
	}

	@Put("/:id/status")
	async updateStatus(@Param("id") id: string, @Body() body: { status: GigStatus }) {
		return GigService.updateStatus(id, body.status);
	}

	@Put("/:id/set")
	async assignSet(@Param("id") id: string, @Body() body: { set_id: string | null }) {
		return GigService.assignSet(id, body.set_id);
	}

	@Delete("/:id")
	async delete(@Param("id") id: string) {
		return GigService.delete(id);
	}
}

