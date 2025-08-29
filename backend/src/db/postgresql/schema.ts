import type { InferSelectModel } from "drizzle-orm";
import {
	pgTable,
	text,
	integer,
	timestamp,
	boolean,
	jsonb,
} from "drizzle-orm/pg-core";
import type { FileItem } from "$db/interface";

export const commonPageFields = {
	pageId: text("page_id").primaryKey(),
	files: jsonb("files").$type<FileItem[]>().notNull(),
	checksum: text("checksum"),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
	}).notNull(),
	deleteAtFirstDownload: boolean("delete_at_first_download").notNull(),
	deleteToken: text("delete_token").notNull(),
	passwordHash: text("password_hash"),
	encrypted: boolean("encrypted").notNull(),
};

export const pagesTable = pgTable("pages", {
	...commonPageFields,
	downloadsNum: integer("downloads_num").notNull(),
	authorToken: text("author_token").notNull(),
});

export const pendingPagesTable = pgTable("pending_pages", {
	...commonPageFields,
	tmpUploadId: text("tmp_upload_id").notNull(),
	wsChannelId: text("ws_channel_id").notNull(),
	setExpiresAtTo: timestamp("set_expires_at_to", {
		withTimezone: true,
	}),
});

export type Page = InferSelectModel<typeof pagesTable>;
export type PendingPage = InferSelectModel<typeof pendingPagesTable>;
