import { z } from "zod";
import fs from "fs";
import path from "path";

let configSerialized: string;
try {
	configSerialized = fs.readFileSync(
		path.join(__dirname, "../data-retention.config.json"),
		"utf-8",
	);
} catch {
	throw new Error(
		"data-retention.config.json file not found or could not be read",
	);
}

let configDeserialized: unknown;
try {
	configDeserialized = JSON.parse(configSerialized);
} catch {
	throw new Error("data-retention.config.json file is not valid JSON");
}

export const config = z
	.array(
		z
			.object({
				limit: z.number().nonnegative(),
				seconds: z.number().int().nonnegative(),
			})
			.strict(),
	)
	.parse(configDeserialized)
	.sort((a, b) => a.limit - b.limit);

export const maxUploadSize = config.at(-1)?.limit ?? Infinity;
