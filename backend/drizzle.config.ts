import { defineConfig } from "drizzle-kit";

const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING;
const POSTGRESQL_DATABASE_URL = process.env.POSTGRESQL_CONNECTION_STRING;
const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH;

if (POSTGRESQL_DATABASE_URL && SQLITE_DB_PATH) {
	throw new Error(
		"Please only set either POSTGRESQL_CONNECTION_STRING or SQLITE_DB_PATH",
	);
}

let db: { type: "postgresql" | "sqlite"; url: string };
if (POSTGRESQL_DATABASE_URL) {
	db = { type: "postgresql", url: POSTGRESQL_DATABASE_URL };
} else if (SQLITE_DB_PATH) {
	db = { type: "sqlite", url: SQLITE_DB_PATH };
} else if (MONGODB_CONNECTION_STRING) {
	if (process.env.QUIET === "1") {
		process.exit(0);
	}
	throw new Error(
		"MongoDB does not require database schema, no need to run bun db:migrate for it",
	);
} else {
	throw new Error("Please set POSTGRESQL_CONNECTION_STRING or SQLITE_DB_PATH");
}

export default defineConfig({
	dialect: db.type,
	schema:
		db.type === "postgresql"
			? "./src/db/schema/postgresql.ts"
			: "./src/db/schema/sqlite.ts",
	dbCredentials: {
		url: db.url,
	},
	verbose: true,
	strict: true,
});
