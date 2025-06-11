import Elysia, { t, NotFoundError } from 'elysia'
import getDB from '$db'
import { deleteFile } from 'src/s3'
import type { PageDocument } from '$db/schema/file'

export const deleteFilesPageRoute = new Elysia().delete(
  '/page',
  async ({ headers }) => {
    const deleteToken = headers.authorization

    const db = await getDB()
    const page = await db
      .collection<PageDocument>('files')
      .findOneAndDelete({ deleteToken, incomplete: { $ne: true } })

    if (!page) throw new NotFoundError()

    if (page) {
      await Promise.all(page.files.map((f) => deleteFile(f.storageId)))
      return { ok: true }
    }
  },
  {
    headers: t.Object({
      authorization: t.String({
        minLength: 1,
      }),
    }),
  },
)
