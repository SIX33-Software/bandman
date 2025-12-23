import { Controller, Get } from "routing-controllers";

@Controller("/health")
export class HealthController {
	@Get("/")
	check() {
		return { status: "ok", timestamp: new Date().toISOString() };
	}
}

