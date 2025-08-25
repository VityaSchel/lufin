import type { PageDocument, PendingPageDocument } from "$db/schema/mongodb";
import {
	pagesTable,
	pendingPagesTable,
	type FileItem,
	type Page,
	type PendingPage,
} from "$db/schema/postgresql";
import { MongoClient, type WithId } from "mongodb";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { inArray, lte, and, eq, sql } from "drizzle-orm";

export let db: (
	| { type: "mongodb"; client: import("mongodb").MongoClient }
	| {
			type: "postgresql";
			client: import("drizzle-orm/node-postgres").NodePgDatabase;
	  }
) & { close: () => Promise<void> };

try {
	const mongodbConn = process.env.MONGODB_CONNECTION_STRING;
	const postgresConn = process.env.POSTGRESQL_CONNECTION_STRING;

	if (mongodbConn && postgresConn) {
		throw new Error(
			"Please set only one of process.env.MONGODB_CONNECTION_STRING or process.env.POSTGRESQL_CONNECTION_STRING",
		);
	}

	if (mongodbConn) {
		console.log("Connecting to MongoDB...");
		const client = await new MongoClient(mongodbConn).connect();
		console.log("Connected to MongoDB database", client.db().databaseName);

		db = {
			type: "mongodb",
			client,
			close: () => client.close(),
		};
	} else if (postgresConn) {
		console.log("Connecting to PostgreSQL...");
		const pool = new Pool({
			connectionString: postgresConn,
		});
		const client = await drizzle({ client: pool });
		const result = await client
			.execute<{ current_database: string }>("SELECT current_database();")
			.then((res) => res.rows[0]);
		if (!result) throw new Error("Failed to get current database name");
		console.log("Connected to PostgreSQL database", result.current_database);
		db = {
			type: "postgresql",
			client,
			close: () => pool.end(),
		};
	} else {
		throw new Error(
			"Please set either process.env.MONGODB_CONNECTION_STRING or process.env.POSTGRESQL_CONNECTION_STRING",
		);
	}
} catch (e) {
	console.error(e instanceof Error ? e.message : e);
	process.exit(1);
}

let closing = false;
process.on("SIGINT", async () => {
	if (closing) return;
	closing = true;
	await db.close();
	process.exit(0);
});

export async function closeDb() {
	await db.close();
}

export async function getPagesExpiredBefore({
	expirationTime,
}: {
	expirationTime: number;
}) {
	if (db.type === "mongodb") {
		return db.client
			.db()
			.collection<PageDocument>("pages")
			.find({ expiresAt: { $lte: new Date(expirationTime) } })
			.toArray();
	} else {
		const pages = db.client
			.select()
			.from(pagesTable)
			.where(lte(pagesTable.expiresAt, new Date(expirationTime)));
		const pendingPages = db.client
			.select()
			.from(pendingPagesTable)
			.where(lte(pendingPagesTable.setExpiresAtTo, new Date(expirationTime)));
		return [...(await pages), ...(await pendingPages)];
	}
}

export async function deletePage({ pageId }: { pageId: string }) {
	if (db.type === "mongodb") {
		return db.client
			.db()
			.collection<PageDocument>("pages")
			.deleteOne({ pageId });
	} else {
		return await db.client
			.delete(pagesTable)
			.where(eq(pagesTable.pageId, pageId));
	}
}

export async function deletePages(pages: { pageId: string }[]) {
	if (db.type === "mongodb") {
		return db.client
			.db()
			.collection<PageDocument>("pages")
			.deleteMany({ pageId: { $in: pages.map((p) => p.pageId) } })
			.then((res) => res.deletedCount);
	} else {
		return await db.client
			.delete(pagesTable)
			.where(
				inArray(
					pagesTable.pageId,
					pages.map((p) => p.pageId),
				),
			)
			.then((res) => res.rowCount ?? 0);
	}
}

export async function deleteCompletePage({
	deleteToken,
}: {
	deleteToken: string;
}) {
	if (db.type === "mongodb") {
		return db.client
			.db()
			.collection<PageDocument>("pages")
			.findOneAndDelete({ deleteToken, incomplete: { $ne: true } });
	} else {
		return await db.client
			.delete(pagesTable)
			.where(and(eq(pagesTable.deleteToken, deleteToken)))
			.returning()
			.then((res) => res[0] ?? null);
	}
}

export async function getPage(props: {
	pending: true;
	tmpUploadId: string;
}): Promise<(WithId<PendingPageDocument> | PendingPage) | null>;
export async function getPage(
	props:
		| {
				pending: true;
				tmpUploadId: string;
		  }
		| {
				pending?: false;
				pageId: string;
		  },
): Promise<
	| (WithId<PendingPageDocument> | PendingPage)
	| (WithId<PageDocument> | Page)
	| null
>;
export async function getPage(props: {
	pending?: false;
	pageId: string;
}): Promise<(WithId<PageDocument> | Page) | null>;
export async function getPage(
	props:
		| {
				pending: true;
				tmpUploadId: string;
		  }
		| {
				pending?: false;
				pageId: string;
		  },
): Promise<
	| (WithId<PendingPageDocument> | PendingPage)
	| (WithId<PageDocument> | Page)
	| null
> {
	if (db.type === "mongodb") {
		if (props.pending === true) {
			const document: WithId<PendingPageDocument> | null = await db.client
				.db()
				.collection<PendingPageDocument>("pages")
				.findOne({
					tmpUploadId: props.tmpUploadId,
					status: "pending",
				});
			return document;
		} else {
			const document: WithId<PageDocument> | null = await db.client
				.db()
				.collection<PageDocument>("pages")
				.findOne({
					pageId: props.pageId,
					status: "complete",
				});
			return document;
		}
	} else {
		if (props.pending === true) {
			const row: PendingPage | null = await db.client
				.select()
				.from(pendingPagesTable)
				.where(eq(pendingPagesTable.tmpUploadId, props.tmpUploadId))
				.then((res) => res[0] ?? null);
			return row;
		} else {
			const row: Page | null = await db.client
				.select()
				.from(pagesTable)
				.where(eq(pagesTable.pageId, props.pageId))
				.then((res) => res[0] ?? null);
			return row;
		}
	}
}

export async function incrementDownloadsNum({ pageId }: { pageId: string }) {
	if (db.type === "mongodb") {
		return db.client
			.db()
			.collection<PageDocument>("pages")
			.updateOne({ pageId }, { $inc: { downloadsNum: 1 } });
	} else {
		return await db.client
			.update(pagesTable)
			.set({ downloadsNum: sql`${pagesTable.downloadsNum} + 1` })
			.where(eq(pagesTable.pageId, pageId));
	}
}

export async function getBasicInfo({ pageId }: { pageId: string }) {
	if (db.type === "mongodb") {
		return db.client
			.db()
			.collection<PageDocument>("pages")
			.findOne(
				{ pageId },
				{
					projection: {
						downloadsNum: true,
						expiresAt: true,
						authorToken: true,
					},
				},
			);
	} else {
		return await db.client
			.select({
				downloadsNum: pagesTable.downloadsNum,
				expiresAt: pagesTable.expiresAt,
				authorToken: pagesTable.authorToken,
			})
			.from(pagesTable)
			.where(eq(pagesTable.pageId, pageId))
			.then((res) => res[0] ?? null);
	}
}

export async function insertPage(
	page: Omit<PendingPageDocument | PendingPage, "files" | "status">,
) {
	if (db.type === "mongodb") {
		return db.client
			.db()
			.collection<PendingPageDocument>("pages")
			.insertOne({
				status: "pending",
				files: [],
				...page,
			});
	} else {
		return await db.client.insert(pendingPagesTable).values({
			files: [],
			...page,
		});
	}
}

export async function completePageUpload(
	{
		tmpUploadId,
	}: {
		tmpUploadId: PendingPage["tmpUploadId"];
	},
	{
		authorToken,
		expiresAt,
	}: {
		authorToken: Page["authorToken"];
		expiresAt: Page["expiresAt"];
	},
) {
	if (db.type === "mongodb") {
		return await db.client
			.db()
			.collection<PageDocument | PendingPageDocument>("pages")
			.findOneAndUpdate(
				{ tmpUploadId, status: "pending" },
				{
					$unset: {
						tmpUploadId: true,
						wsChannelId: true,
						setExpiresAtTo: true,
					},
					$set: {
						authorToken: authorToken,
						downloadsNum: 0,
						expiresAt,
						status: "complete",
					},
				},
				{ returnDocument: "after" },
			);
	} else {
		return await db.client.transaction(async (tx) => {
			const pendingPage = await tx
				.delete(pendingPagesTable)
				.where(eq(pendingPagesTable.tmpUploadId, tmpUploadId))
				.returning()
				.then((res) => res[0]);

			if (!pendingPage) return null;

			await tx.insert(pagesTable).values({
				pageId: pendingPage.pageId,
				files: pendingPage.files,
				checksum: pendingPage.checksum,
				deleteAtFirstDownload: pendingPage.deleteAtFirstDownload,
				deleteToken: pendingPage.deleteToken,
				encrypted: pendingPage.encrypted,
				passwordHash: pendingPage.passwordHash,
				authorToken,
				expiresAt,
				downloadsNum: 0,
			});
		});
	}
}

export async function pushFile({ pageId }: { pageId: string }, file: FileItem) {
	if (db.type === "mongodb") {
		return db.client
			.db()
			.collection<PendingPage>("pages")
			.updateOne(
				{ pageId, status: "pending" },
				{
					$push: {
						files: {
							storageId: file.storageId,
							filename: file.filename,
							filesizeInBytes: file.filesizeInBytes,
							mimeType: file.mimeType,
						},
					},
				},
			);
	} else {
		return await db.client
			.update(pendingPagesTable)
			.set({
				files: sql`${pendingPagesTable.files} || ${JSON.stringify([file])}::jsonb`,
			})
			.where(eq(pendingPagesTable.pageId, pageId));
	}
}
