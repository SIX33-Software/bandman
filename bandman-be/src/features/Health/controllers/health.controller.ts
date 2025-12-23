import { Controller, Get, JsonController } from "routing-controllers";

@JsonController("/health")
export class HealthController {
	@Get("/")
	check() {
		return { status: "ok", timestamp: new Date().toISOString() };
	}
}

