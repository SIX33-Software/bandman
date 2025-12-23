import { Body, Controller, Get, HttpCode, Post, UseBefore, CurrentUser, JsonController, Req } from "routing-controllers";
import { AuthService } from "../services";
import { SignInDto, SignUpDto, AuthUser } from "../types";
import { AuthMiddleware } from "../middlewares";
import type { Request } from "express";

interface AuthenticatedRequest extends Request {
	accessToken?: string;
}

@JsonController("/auth")
export class AuthController {
	@Post("/signup")
	@HttpCode(201)
	signUp(@Body() body: SignUpDto) {
		return AuthService.signUp(body);
	}

	@Post("/signin")
	signIn(@Body() body: SignInDto) {
		return AuthService.signIn(body);
	}

	@Get("/me")
	@UseBefore(AuthMiddleware)
	async me(@CurrentUser({ required: true }) user: AuthUser, @Req() req: AuthenticatedRequest) {
		const profile = await AuthService.getOrCreateProfile(user, req.accessToken);
		return profile;
	}
}

