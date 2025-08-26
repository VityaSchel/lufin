import { MongoClient } from "mongodb";
import type { LufinDbBuilder } from "$db/interface";
import type { PageDocument, PendingPageDocument } from "$db/mongodb/schema";

export const mongoDb: LufinDbBuilder<void, import("mongodb").MongoClient> = (
	_,
	client,
) => ({
	async getPagesExpiredBefore(date) {
		return await client
			.db()
			.collection<Pick<PageDocument, "pageId" | "files">>("pages")
			.find(
				{ expiresAt: { $lte: date } },
				{
					projection: { pageId: true, _id: false, files: true },
				},
			)
			.toArray();
	},
	async deletePage(pageId) {
		await client.db().collection<PageDocument>("pages").deleteOne({ pageId });
	},
	async deletePages(pageIds) {
		return await client
			.db()
			.collection<PageDocument>("pages")
			.deleteMany({ pageId: { $in: pageIds } })
			.then((res) => res.deletedCount);
	},
	async deleteCompletePageByDeleteToken(token) {
		return await client
			.db()
			.collection<Pick<PageDocument, "files">>("pages")
			.findOneAndDelete(
				{ deleteToken: token, incomplete: { $ne: true } },
				{ projection: { files: true, _id: false } },
			);
	},
	async incrementDownloadsNum({ pageId }) {
		await client
			.db()
			.collection<PageDocument>("pages")
			.updateOne({ pageId }, { $inc: { downloadsNum: 1 } });
	},
	async getPageBasicInfo(pageId) {
		return await client
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
	},
	async insertPage(page) {
		await client
			.db()
			.collection<PendingPageDocument>("pages")
			.insertOne({
				status: "pending",
				files: [],
				...page,
			});
	},
	async completePageUpload({ tmpUploadId }, { authorToken, expiresAt }) {
		await client
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
	},
	async pushFile({ pageId }, file) {
		await client
			.db()
			.collection<PendingPageDocument>("pages")
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
	},
	async getPendingPage(query) {
		return await client
			.db()
			.collection<PendingPageDocument>("pages")
			.findOne(
				{
					tmpUploadId: query.tmpUploadId,
					status: "pending",
				},
				{
					projection: { _id: false },
				},
			);
	},
	async getPage(pageId) {
		return await client
			.db()
			.collection<PageDocument>("pages")
			.findOne(
				{
					pageId: pageId,
					status: "complete",
				},
				{
					projection: { _id: false },
				},
			);
	},
	async close() {
		await client.close();
	},
});

export async function connectMongoDb(connectionString: string) {
	console.log("Connecting to MongoDB...");
	const client = await new MongoClient(connectionString).connect();
	console.log("Connected to MongoDB database", client.db().databaseName);
	return mongoDb(undefined, client);
}
