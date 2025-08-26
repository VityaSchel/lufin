import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import type { InferSelectModel } from "drizzle-orm";
import type { FileItem } from "$db/interface";

export const commonPageFields = {
	pageId: text("page_id").primaryKey(),
	files: text("files", { mode: "json" }).$type<FileItem[]>().notNull(),
	checksum: text("checksum"),
	expiresAt: integer("expires_at", {
		mode: "timestamp",
	}).notNull(),
	deleteAtFirstDownload: integer("delete_at_first_download", {
		mode: "boolean",
	}).notNull(),
	deleteToken: text("delete_token").notNull(),
	passwordHash: text("password_hash"),
	encrypted: integer("encrypted", {
		mode: "boolean",
	}).notNull(),
};

export const pagesTable = sqliteTable("pages", {
	...commonPageFields,
	downloadsNum: integer("downloads_num").notNull(),
	authorToken: text("author_token").notNull(),
});

export const pendingPagesTable = sqliteTable("pending_pages", {
	...commonPageFields,
	tmpUploadId: text("tmp_upload_id").notNull(),
	wsChannelId: text("ws_channel_id").notNull(),
	setExpiresAtTo: integer("set_expires_at_to", {
		mode: "timestamp",
	}),
});

export type Page = InferSelectModel<typeof pagesTable>;
export type PendingPage = InferSelectModel<typeof pendingPagesTable>;
