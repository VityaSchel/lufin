import type { LufinDbBuilder } from "$db/interface";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { pagesTable, pendingPagesTable } from "./schema";
import { inArray, lte, and, eq, sql } from "drizzle-orm";

export const sqliteDb: LufinDbBuilder<
	import("drizzle-orm/bun-sqlite").BunSQLiteDatabase,
	Database
> = (client, conn) => ({
	async getPagesExpiredBefore(date) {
		const pages = client
			.select({
				pageId: pagesTable.pageId,
				files: pagesTable.files,
			})
			.from(pagesTable)
			.where(lte(pagesTable.expiresAt, date));
		const pendingPages = client
			.select({
				pageId: pendingPagesTable.pageId,
				files: pendingPagesTable.files,
			})
			.from(pendingPagesTable)
			.where(lte(pendingPagesTable.setExpiresAtTo, date));
		return [...(await pages), ...(await pendingPages)];
	},
	async deletePage(pageId) {
		await client.delete(pagesTable).where(eq(pagesTable.pageId, pageId));
	},
	async deletePages(pageIds) {
		return await client
			.delete(pagesTable)
			.where(inArray(pagesTable.pageId, pageIds))
			.returning({})
			.then((res) => res.length);
	},
	async deleteCompletePageByDeleteToken(token) {
		return await client
			.delete(pagesTable)
			.where(and(eq(pagesTable.deleteToken, token)))
			.returning()
			.then((res) => res[0] ?? null);
	},
	async getPendingPage(query) {
		return await client
			.select({
				pageId: pendingPagesTable.pageId,
				wsChannelId: pendingPagesTable.wsChannelId,
				expiresAt: pendingPagesTable.expiresAt,
				passwordHash: pendingPagesTable.passwordHash,
				encrypted: pendingPagesTable.encrypted,
				checksum: pendingPagesTable.checksum,
				files: pendingPagesTable.files,
				deleteAtFirstDownload: pendingPagesTable.deleteAtFirstDownload,
				setExpiresAtTo: pendingPagesTable.setExpiresAtTo,
			})
			.from(pendingPagesTable)
			.where(eq(pendingPagesTable.tmpUploadId, query.tmpUploadId))
			.then((res) => res[0] ?? null);
	},
	async getPage(pageId) {
		return await client
			.select({
				expiresAt: pagesTable.expiresAt,
				passwordHash: pagesTable.passwordHash,
				encrypted: pagesTable.encrypted,
				checksum: pagesTable.checksum,
				files: pagesTable.files,
				deleteAtFirstDownload: pagesTable.deleteAtFirstDownload,
			})
			.from(pagesTable)
			.where(eq(pagesTable.pageId, pageId))
			.then((res) => res[0] ?? null);
	},
	async incrementDownloadsNum({ pageId }) {
		await client
			.update(pagesTable)
			.set({ downloadsNum: sql`${pagesTable.downloadsNum} + 1` })
			.where(eq(pagesTable.pageId, pageId));
	},
	async getPageBasicInfo(pageId) {
		return await client
			.select({
				downloadsNum: pagesTable.downloadsNum,
				expiresAt: pagesTable.expiresAt,
				authorToken: pagesTable.authorToken,
			})
			.from(pagesTable)
			.where(eq(pagesTable.pageId, pageId))
			.then((res) => res[0] ?? null);
	},
	async insertPage(page) {
		await client.insert(pendingPagesTable).values({
			files: [],
			...page,
		});
	},
	async completePageUpload({ tmpUploadId }, { authorToken, expiresAt }) {
		await client.transaction(async (tx) => {
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
	},
	async pushFile({ pageId }, file) {
		await client
			.update(pendingPagesTable)
			.set({
				files: sql`${pendingPagesTable.files} || ${JSON.stringify([file])}::jsonb`,
			})
			.where(eq(pendingPagesTable.pageId, pageId));
	},
	async close() {
		await conn.close();
	},
});

export async function openSqlite(filePath: string) {
	console.log("Opening SQLite database...");
	const sqlite = new Database(filePath);
	const client = drizzle({ client: sqlite });
	console.log("Opened SQLite database");
	return sqliteDb(client, sqlite);
}
