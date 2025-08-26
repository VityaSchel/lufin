import { defineConfig } from "drizzle-kit";

const POSTGRESQL_DATABASE_URL = process.env.POSTGRESQL_CONNECTION_STRING;
const SQLITE_DB_FILE_NAME = process.env.SQLITE_DB_FILE_NAME;

if (POSTGRESQL_DATABASE_URL && SQLITE_DB_FILE_NAME) {
	throw new Error(
		"Please only set either POSTGRESQL_CONNECTION_STRING or SQLITE_DB_FILE_NAME",
	);
}

let db: { type: "postgresql" | "sqlite"; url: string };
if (POSTGRESQL_DATABASE_URL)
	db = { type: "postgresql", url: POSTGRESQL_DATABASE_URL };
else if (SQLITE_DB_FILE_NAME) db = { type: "sqlite", url: SQLITE_DB_FILE_NAME };
else
	throw new Error(
		"Please set POSTGRESQL_CONNECTION_STRING or SQLITE_DB_FILE_NAME",
	);

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
