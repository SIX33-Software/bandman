import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { AuthService } from "../services";

@Middleware({ type: "before" })
export class AuthMiddleware implements ExpressMiddlewareInterface {
	async use(request: any, response: any, next: (err?: any) => any): Promise<void> {
		const authHeader = request.headers?.authorization as string | undefined;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			response.status(401).send({ success: false, message: "Missing Authorization header" });
			return;
		}

		const token = authHeader.slice("Bearer ".length).trim();
		const user = await AuthService.getUserFromAccessToken(token);
		if (!user.success || !user.data) {
			response.status(401).send({ success: false, message: user.message || "Unauthorized" });
			return;
		}

		request.user = user.data;
		request.accessToken = token;
		next();
	}
}

