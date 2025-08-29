import { Client } from "pg";
import { Database } from "bun:sqlite";

const postgresqlConn = process.env.POSTGRESQL_CONNECTION_STRING;
const sqliteDbPath = process.env.SQLITE_DB_PATH;

if (postgresqlConn && sqliteDbPath) {
	throw new Error(
		"Only one of POSTGRESQL_CONNECTION_STRING or SQLITE_DB_PATH must be set"
	);
}

interface DbShim {
	getMatchesCount(
		tableName: string,
		query?: {
			[key: string]: string | number;
		}
	): Promise<number>;
}

export function getDb(): {
	db: DbShim;
	open: () => Promise<void> | void;
	close: () => Promise<void> | void;
	dbName: string;
} {
	if (postgresqlConn) {
		const db = new Client({
			connectionString: postgresqlConn,
		});
		return {
			dbName: "PostgreSQL",
			db: {
				getMatchesCount: async (tableName, query) => {
					let condition = "";
					let values: (string | number)[] = [];
					if (query) {
						const keys = Object.keys(query);
						values = Object.values(query);
						const whereClause = keys
							.map((key, index) => `"${key}" = $${index + 1}`)
							.join(" AND ");
						condition = ` WHERE ${whereClause}`;
					}
					const res = await db.query(
						`SELECT COUNT(*) FROM ${tableName}${condition}`,
						values
					);
					return parseInt(res.rows[0]?.count ?? "0", 10);
				},
			},
			open: () => db.connect(),
			close: () => db.end(),
		};
	} else if (sqliteDbPath) {
		const db = new Database(sqliteDbPath, {
			readonly: true,
		});
		return {
			dbName: "SQLite",
			db: {
				getMatchesCount: async (tableName, query) => {
					let condition = "";
					let values: (string | number)[] = [];
					if (query) {
						const keys = Object.keys(query);
						values = Object.values(query);
						const whereClause = keys.map((key) => `"${key}" = ?`).join(" AND ");
						condition = ` WHERE ${whereClause}`;
					}
					const stmt = db.prepare(
						`SELECT COUNT(*) as count FROM ${tableName}${condition}`
					);
					const res = stmt.get(...values) as { count: number } | undefined;
					return res?.count ?? 0;
				},
			},
			open: () => {},
			close: () => db.close(),
		};
	} else {
		throw new Error(
			"Either POSTGRESQL_CONNECTION_STRING or SQLITE_DB_PATH must be set"
		);
	}
}
