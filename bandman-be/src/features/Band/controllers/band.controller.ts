import {
	Get,
	Post,
	Put,
	Delete,
	Param,
	Body,
	QueryParams,
	HttpCode,
	JsonController,
	Req,
	UseBefore,
} from "routing-controllers";
import { BandService } from "../services";
import { CreateBandDto, UpdateBandDto, AddBandMemberDto, UpdateBandMemberDto, AddBandSongDto } from "../types";
import { PaginationDto } from "@/common/dto";
import { AuthMiddleware } from "@/features/Auth/middlewares";
import { RequestWithUserData } from "@/types";

@JsonController("/bands")
export class BandController {
	@Post("/")
	@UseBefore(AuthMiddleware)
	async create(@Req() req: RequestWithUserData, @Body() body: CreateBandDto) {
		const userId = req.user?.id;
		const accessToken = req.accessToken;
		if (!userId) {
			return { success: false, message: "Unauthorized" };
		}

		const created = await BandService.create({ ...body, created_by: userId } as any);
		if (!created.success || !created.data) {
			return created;
		}

		// Ensure creator is an owner member so /bands (my bands) returns it
		await BandService.addMember(created.data.id, { user_id: userId, role: "owner" }, accessToken);
		return created;
	}

	@Get("/")
	@UseBefore(AuthMiddleware)
	async getAll(@Req() req: RequestWithUserData, @QueryParams() query: PaginationDto) {
		const userId = req.user?.id;
		const accessToken = req.accessToken;
		if (!userId) {
			return { success: false, message: "Unauthorized", pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
		}
		return BandService.findByUser(userId, query, accessToken);
	}

	@Get("/:id")
	async getById(@Param("id") id: string) {
		return BandService.findById(id);
	}

	@Put("/:id")
	async update(@Param("id") id: string, @Body() body: UpdateBandDto) {
		return BandService.update(id, body);
	}

	@Delete("/:id")
	async delete(@Param("id") id: string) {
		return BandService.delete(id);
	}

	// ============ MEMBERS ============
	@Get("/:id/members")
	async getMembers(@Param("id") id: string) {
		return BandService.getMembers(id);
	}

	@Post("/:id/members")
	@HttpCode(201)
	async addMember(@Param("id") id: string, @Body() body: AddBandMemberDto) {
		return BandService.addMember(id, body);
	}

	@Put("/:id/members/:userId")
	async updateMember(@Param("id") id: string, @Param("userId") userId: string, @Body() body: UpdateBandMemberDto) {
		return BandService.updateMember(id, userId, body);
	}

	@Delete("/:id/members/:userId")
	async removeMember(@Param("id") id: string, @Param("userId") userId: string) {
		return BandService.removeMember(id, userId);
	}

	// ============ BAND SONGS (Song List) ============
	@Get("/:id/songs")
	async getSongs(@Param("id") id: string, @QueryParams() query: PaginationDto) {
		return BandService.getSongs(id, query);
	}

	@Post("/:id/songs")
	@HttpCode(201)
	async addSong(@Param("id") id: string, @Body() body: AddBandSongDto) {
		return BandService.addSong(id, body);
	}

	@Delete("/:id/songs/:songId")
	async removeSong(@Param("id") id: string, @Param("songId") songId: string) {
		return BandService.removeSong(id, songId);
	}
}

