import { db } from "$db";
import Elysia, { t, NotFoundError } from "elysia";
import { maxUploadSize } from "src/config";
import { uploadFiles } from "src/utils/submit-files";

export const uploadFilesRoute = new Elysia().post(
	"/upload/:tmpUploadId",
	async ({ body, params: { tmpUploadId }, set }) => {
		const bodyFiles = Object.entries(body).filter(
			(e): e is [string, File] => e[1] instanceof File,
		);
		if (bodyFiles.length === 0) {
			set.status = 400;
			return {
				ok: false,
				error: "INVALID_BODY_SCHEMA",
				validationError: "You must pass at least one file",
			};
		}

		const page = await db.getPendingPage({ tmpUploadId });

		if (page === null) throw new NotFoundError();

		if (
			(page.deleteAtFirstDownload && page.files.length > 1) ||
			page.files.length + bodyFiles.length > 100
		) {
			return { ok: false, error: "TOO_MANY_FILES" };
		}
		if (page.expiresAt.getTime() <= Date.now()) {
			return { ok: false, error: "LINK_EXPIRED" };
		}

		const sumNewFileSizeBytes = bodyFiles.reduce(
			(prev, [, file]) => prev + file.size,
			0,
		);
		const sumExistingFileSizeBytes = page.files.reduce(
			(prev, file) => prev + file.filesizeInBytes,
			0,
		);
		if (
			sumNewFileSizeBytes + sumExistingFileSizeBytes >
			maxUploadSize * 1000 * 1000
		) {
			set.status = 413;
			return { ok: false, error: "FILES_ARE_TOO_BIG" };
		}
		await uploadFiles({
			pageId: page.pageId,
			wsChannelId: page.wsChannelId,
			files: bodyFiles.map(([fieldname, file]) => ({
				fieldname,
				file,
			})),
		});

		return { ok: true };
	},
	{
		body: t.Record(t.String(), t.Union([t.String(), t.File()])),
	},
);
