export type FileItem = {
	storageId: string;
	filename: string;
	filesizeInBytes: number;
	mimeType: string;
};

export type BasePage = {
	pageId: string;
	files: FileItem[];
	checksum: string | null;
	expiresAt: Date;
	deleteAtFirstDownload: boolean;
	deleteToken: string;
	passwordHash: string | null;
	encrypted: boolean;
};

export type PendingPage = BasePage & {
	status: "pending";
	tmpUploadId: string;
	wsChannelId: string;
	setExpiresAtTo: Date | null;
};

export type Page = BasePage & {
	status: "complete";
	downloadsNum: 0;
	authorToken: string;
};

export interface LufinDb {
	getPagesExpiredBefore(
		date: Date,
	): Promise<{ pageId: string; files: FileItem[] }[]>;
	deletePage(pageId: string): Promise<void>;
	deletePages(pageIds: string[]): Promise<number>;
	deleteCompletePageByDeleteToken(
		token: string,
	): Promise<{ files: FileItem[] } | null>;
	getPendingPage(query: { tmpUploadId: string }): Promise<{
		pageId: string;
		wsChannelId: string;
		expiresAt: Date;
		passwordHash: string | null;
		encrypted: boolean;
		checksum: string | null;
		files: FileItem[];
		deleteAtFirstDownload: boolean;
		setExpiresAtTo: Date | null;
	} | null>;
	getPage(pageId: string): Promise<{
		expiresAt: Date;
		passwordHash: string | null;
		encrypted: boolean;
		checksum: string | null;
		files: FileItem[];
		deleteAtFirstDownload: boolean;
	} | null>;
	incrementDownloadsNum(query: { pageId: string }): Promise<void>;
	getPageBasicInfo(pageId: string): Promise<{
		downloadsNum: number;
		expiresAt: Date;
		authorToken: string;
	} | null>;
	insertPage(page: Omit<PendingPage, "files" | "status">): Promise<void>;
	completePageUpload(
		query: {
			tmpUploadId: string;
		},
		update: {
			authorToken: string;
			expiresAt: Date;
		},
	): Promise<void>;
	pushFile(
		query: {
			pageId: string;
		},
		file: FileItem,
	): Promise<void>;
	close(): Promise<void>;
}

export type LufinDbBuilder<T, U> = (client: T, conn: U) => LufinDb;
