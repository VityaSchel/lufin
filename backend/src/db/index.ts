import type { LufinDb } from "$db/interface";
import { connectMongoDb } from "$db/mongodb";
import { connectPostgres } from "$db/postgresql";
import { openSqlite } from "$db/sqlite";

export let db: LufinDb;
try {
	const mongodbConn = process.env.MONGODB_CONNECTION_STRING;
	const postgresConn = process.env.POSTGRESQL_CONNECTION_STRING;
	const sqliteFilepath = process.env.SQLITE_DB_PATH;

	if (
		[
			Boolean(mongodbConn),
			Boolean(postgresConn),
			Boolean(sqliteFilepath),
		].filter(Boolean).length !== 1
	) {
		throw new Error(
			"Please set only one of MONGODB_CONNECTION_STRING or POSTGRESQL_CONNECTION_STRING or SQLITE_DB_PATH",
		);
	}

	if (mongodbConn) {
		db = await connectMongoDb(mongodbConn);
	} else if (postgresConn) {
		db = await connectPostgres(postgresConn);
	} else if (sqliteFilepath) {
		db = await openSqlite(sqliteFilepath);
	} else {
		throw new Error(
			"Please set either MONGODB_CONNECTION_STRING or POSTGRESQL_CONNECTION_STRING or SQLITE_DB_PATH",
		);
	}
} catch (e) {
	console.error(e instanceof Error ? e.message : e);
	process.exit(1);
}

let closing = false;
export async function closeDb() {
	if (closing) return;
	closing = true;
	await db.close();
}
