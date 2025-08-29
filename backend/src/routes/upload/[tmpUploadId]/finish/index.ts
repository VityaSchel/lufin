import Elysia, { t, NotFoundError } from "elysia";
import { sendUpdate as sendWsUpdate } from "src/ws";
import { nanoid } from "nanoid";
import { getMaxExpirationTime } from "src/utils/expiration-time";
import { db } from "$db";

export const finishFilesUploadRoute = new Elysia().post(
	"/upload/:tmpUploadId/finish",
	async ({ params: { tmpUploadId }, set }) => {
		const page = await db.getPendingPage({
			tmpUploadId,
		});

		if (page === null) throw new NotFoundError();

		if (Number(page.files?.length) < 1) {
			set.status = 400;
			return { ok: false, error: "NO_FILES_UPLOADED" };
		}

		const authorToken = nanoid(32);

		const pageFilesSize = page.files.reduce(
			(acc, f) => acc + f.filesizeInBytes,
			0,
		);

		const expiresAt =
			page.setExpiresAtTo ??
			new Date(Date.now() + getMaxExpirationTime(pageFilesSize));

		await db.completePageUpload(
			{ tmpUploadId },
			{
				expiresAt,
				authorToken,
			},
		);

		sendWsUpdate(page.wsChannelId, {
			type: "upload_success",
			pageId: page.pageId,
			authorToken: authorToken,
			pageExpiresAt: expiresAt.getTime(),
		});

		return { ok: true };
	},
	{
		params: t.Object({
			tmpUploadId: t.String({
				minLength: 1,
			}),
		}),
	},
);
