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
import { SongService } from "../services";
import { CreateSongDto, UpdateSongDto } from "../types";
import { PaginationDto } from "@/common/dto";

@JsonController("/songs")
export class SongController {
	@Get("/")
	async getAll(@QueryParams() query: PaginationDto) {
		return SongService.findAll(query);
	}

	@Get("/search")
	async search(
		@QueryParam("q") q: string,
		@QueryParam("owner_id") ownerId: string,
		@QueryParams() query: PaginationDto
	) {
		return SongService.search(q, ownerId, query);
	}

	@Get("/owner/:ownerId")
	async getByOwner(@Param("ownerId") ownerId: string, @QueryParams() query: PaginationDto) {
		return SongService.findByOwner(ownerId, query);
	}

	@Get("/:id")
	async getById(@Param("id") id: string) {
		return SongService.findById(id);
	}

	@Post("/")
	@HttpCode(201)
	async create(@Body() body: CreateSongDto) {
		return SongService.create(body);
	}

	@Put("/:id")
	async update(@Param("id") id: string, @Body() body: UpdateSongDto) {
		return SongService.update(id, body);
	}

	@Delete("/:id")
	async delete(@Param("id") id: string) {
		return SongService.delete(id);
	}
}

