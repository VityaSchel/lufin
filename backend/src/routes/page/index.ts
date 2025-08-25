import Elysia, { t, NotFoundError } from "elysia";
import { deleteCompletePage } from "$db";
import * as s3 from "src/s3";

export const deleteFilesPageRoute = new Elysia().delete(
	"/page",
	async ({ headers }) => {
		const deleteToken = headers.authorization;

		const page = await deleteCompletePage({ deleteToken });

		if (!page) throw new NotFoundError();

		if (page) {
			await Promise.all(page.files.map((f) => s3.del(f.storageId)));
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
