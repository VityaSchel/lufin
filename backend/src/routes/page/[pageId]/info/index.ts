import Elysia, { t, NotFoundError } from "elysia";
import { db } from "$db";

export const getFilesPageInfoRoute = new Elysia().get(
	"/page/:pageId/info",
	async ({ headers, params: { pageId } }) => {
		const filesPage = await db.getPageBasicInfo(pageId);
		if (!filesPage || filesPage.authorToken !== headers.authorization) {
			throw new NotFoundError();
		}
		return {
			ok: true,
			downloads: filesPage.downloadsNum,
			expiresAt: filesPage.expiresAt,
		};
	},
	{
		params: t.Object({
			pageId: t.String({
				minLength: 1,
			}),
		}),
		headers: t.Object({
			authorization: t.String({
				minLength: 1,
			}),
		}),
	},
);
