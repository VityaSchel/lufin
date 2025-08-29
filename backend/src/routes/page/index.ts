import Elysia, { t, NotFoundError } from "elysia";
import { storage } from "$storage";
import { db } from "$db";

export const deleteFilesPageRoute = new Elysia().delete(
	"/page",
	async ({ headers }) => {
		const deleteToken = headers.authorization;

		const page = await db.deleteCompletePageByDeleteToken(deleteToken);

		if (!page) throw new NotFoundError();

		if (page) {
			await Promise.all(page.files.map((f) => storage.del(f.storageId)));
			return { ok: true };
		}
	},
	{
		headers: t.Object({
			authorization: t.String({
				minLength: 1,
			}),
		}),
	},
);
