import Elysia from "elysia";
import { config } from "src/config";

export const limitsRoute = new Elysia().get("/limits", async () => {
	return config;
});
