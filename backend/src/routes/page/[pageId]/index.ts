import Elysia, { t, NotFoundError } from "elysia";
import * as s3 from "src/s3";
import { db } from "$db";

export class PageMiddlewareError extends Error {
	constructor(
		public status: number,
		public message: "PAGE_PASSWORD_PROTECTED" | "INVALID_PAGE_PASSWORD",
	) {
		super(message);
	}
}

export const getFilesPageSubrouter = new Elysia({ prefix: "/page/:pageId" })
	.resolve(async ({ params: { pageId }, headers }) => {
		const page = await db.getPage(pageId);
		if (!page || page.expiresAt.getTime() <= Date.now()) {
			throw new NotFoundError();
		}

		const storedPasswordHash = page.passwordHash;
		if (storedPasswordHash) {
			const inputPassword = headers.authorization;
			if (!inputPassword) {
				throw new PageMiddlewareError(401, "PAGE_PASSWORD_PROTECTED");
			}

			const isPasswordValid = await Bun.password.verify(
				inputPassword,
				storedPasswordHash,
			);

			if (!isPasswordValid) {
				throw new PageMiddlewareError(401, "INVALID_PAGE_PASSWORD");
			}
		}

		return { page };
	})
	.get(
		"/",
		async ({ page }) => {
			return {
				ok: true,
				encrypted: page.encrypted,
				...(page.checksum !== null && { checksum: page.checksum }),
				files: page.files.map((f) => ({
					filename: f.filename,
					sizeInBytes: f.filesizeInBytes,
					mimeType: f.mimeType ?? "",
				})),
			};
		},
		{
			params: t.Object({
				pageId: t.String({
					minLength: 1,
				}),
			}),
		},
	)
	.get(
		"/:file",
		async ({ params, set, page }) => {
			const pageId = params.pageId;
			const fileNameOrIndex = params.file;

			if (page.deleteAtFirstDownload) {
				await db.deletePage(pageId);
			} else {
				await db.incrementDownloadsNum({ pageId });
			}

			let file = page.files.find((f) => f.filename === fileNameOrIndex);
			if (!file) {
				const fileIndex = Number(fileNameOrIndex);
				if (
					Number.isSafeInteger(fileIndex) &&
					fileIndex >= 0 &&
					fileIndex < page.files.length
				) {
					file = page.files[fileIndex];
				}
				if (!file) {
					set.status = 404;
					return { ok: false, error: "FILE_INDEX_INVALID" };
				}
			}

			const stream = file.filesizeInBytes > 10 * 1000 * 1000;

			const content = s3.download(file.storageId, stream);

			set.headers["content-type"] = page.encrypted
				? "application/octet-stream"
				: (file.mimeType ?? "application/octet-stream");

			set.headers["content-length"] = file.filesizeInBytes;

			return content;
		},
		{
			params: t.Object({
				pageId: t.String({
					minLength: 1,
				}),
				file: t.String({
					minLength: 1,
				}),
			}),
		},
	);
