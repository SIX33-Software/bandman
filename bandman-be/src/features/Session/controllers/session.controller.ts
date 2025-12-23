import {
	Controller,
	Get,
	Post,
	Put,
	Param,
	Body,
	HttpCode,
	UseBefore,
	CurrentUser,
	JsonController,
} from "routing-controllers";
import { SessionService } from "../services";
import { CreateSessionDto, UpdateSessionDto, ChangeSongDto } from "../types";
import { AuthMiddleware } from "@/features/Auth/middlewares";
import { AuthUser } from "@/features/Auth/types";

@JsonController("/sessions")
export class SessionController {
	@Get("/:id")
	async getById(@Param("id") id: string) {
		return SessionService.findById(id);
	}

	@Get("/band/:bandId/active")
	async getActiveByBand(@Param("bandId") bandId: string) {
		return SessionService.findActiveByBand(bandId);
	}

	@Post("/")
	@HttpCode(201)
	@UseBefore(AuthMiddleware)
	async create(@Body() body: CreateSessionDto, @CurrentUser({ required: true }) user: AuthUser) {
		return SessionService.create({
			...body,
			current_song_id: null,
			current_song_position: 0,
			status: "active",
			started_by: user.id,
		});
	}

	@Put("/:id")
	@UseBefore(AuthMiddleware)
	async update(
		@Param("id") id: string,
		@Body() body: UpdateSessionDto,
		@CurrentUser({ required: true }) user: AuthUser
	) {
		const auth = await SessionService.canControl(id, user.id);
		if (!auth.success) {
			return auth;
		}

		return SessionService.update(id, body);
	}

	@Post("/:id/end")
	@UseBefore(AuthMiddleware)
	async endSession(@Param("id") id: string, @CurrentUser({ required: true }) user: AuthUser) {
		const auth = await SessionService.canControl(id, user.id);
		if (!auth.success) {
			return auth;
		}

		return SessionService.endSession(id);
	}

	@Post("/:id/pause")
	@UseBefore(AuthMiddleware)
	async pauseSession(@Param("id") id: string, @CurrentUser({ required: true }) user: AuthUser) {
		const auth = await SessionService.canControl(id, user.id);
		if (!auth.success) {
			return auth;
		}

		return SessionService.pauseSession(id);
	}

	@Post("/:id/resume")
	@UseBefore(AuthMiddleware)
	async resumeSession(@Param("id") id: string, @CurrentUser({ required: true }) user: AuthUser) {
		const auth = await SessionService.canControl(id, user.id);
		if (!auth.success) {
			return auth;
		}

		return SessionService.resumeSession(id);
	}

	@Post("/:id/song")
	@UseBefore(AuthMiddleware)
	async changeSong(
		@Param("id") id: string,
		@Body() body: ChangeSongDto,
		@CurrentUser({ required: true }) user: AuthUser
	) {
		const auth = await SessionService.canControl(id, user.id);
		if (!auth.success) {
			return auth;
		}

		return SessionService.changeSong(id, body.song_id, body.position);
	}

	@Post("/:id/next")
	@UseBefore(AuthMiddleware)
	async nextSong(@Param("id") id: string, @CurrentUser({ required: true }) user: AuthUser) {
		const auth = await SessionService.canControl(id, user.id);
		if (!auth.success) {
			return auth;
		}

		return SessionService.nextSong(id);
	}

	@Post("/:id/previous")
	@UseBefore(AuthMiddleware)
	async previousSong(@Param("id") id: string, @CurrentUser({ required: true }) user: AuthUser) {
		const auth = await SessionService.canControl(id, user.id);
		if (!auth.success) {
			return auth;
		}

		return SessionService.previousSong(id);
	}
}

