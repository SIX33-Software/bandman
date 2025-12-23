import { Request } from "express";
import { AuthUser } from "@/features/Auth/types";

export interface RequestWithUserData extends Request {
	user?: AuthUser;
	accessToken?: string;
}
