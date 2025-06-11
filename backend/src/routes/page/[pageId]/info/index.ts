import Elysia, { t, NotFoundError } from 'elysia'
import getDB from '$db'
import type { PageDocument } from '$db/schema/file'

export const getFilesPageInfoRoute = new Elysia().get(
  '/page/:pageId/info',
  async ({ headers, params: { pageId } }) => {
    const db = await getDB()
    const filesPage = await db
      .collection<PageDocument>('files')
      .findOne({ pageId })
    if (!filesPage || filesPage.authorToken !== headers.authorization) {
      throw new NotFoundError()
    }
    return {
      ok: true,
      exists: true,
      downloads: filesPage.downloadsNum,
      expiresAt: filesPage.expiresAt,
    }
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
)
