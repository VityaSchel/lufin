import getDB from '$db'
import Elysia, { t, NotFoundError } from 'elysia'
import { sendUpdate as sendWsUpdate } from 'src/ws'
import { nanoid } from 'nanoid'
import type { PageDocument, PendingPageDocument } from '$db/schema/file'

export const finishFilesUploadRoute = new Elysia().post(
  '/upload/:tmpUploadId/finish',
  async ({ params: { tmpUploadId, pageId }, set }) => {
    const db = await getDB()

    const page = await db.collection<PendingPageDocument>('files').findOne({
      incomplete: true,
      tmpUploadId,
    })

    if (page === null) throw new NotFoundError()

    if (Number(page.files?.length) < 1) {
      set.status = 400
      return { ok: false, error: 'NO_FILES_UPLOADED' }
    }

    const authorToken = nanoid(32)

    await db.collection<PageDocument>('files').updateOne(
      { pageId },
      {
        $unset: { incomplete: true, tmpUploadId: true, wsChannelId: true },
        $set: {
          authorToken: authorToken,
          downloadsNum: 0,
        },
      },
    )

    sendWsUpdate(page.wsChannelId, {
      type: 'upload_success',
      pageId: page.pageId,
      authorToken: authorToken,
    })

    return { ok: true }
  },
  {
    params: t.Object({
      tmpUploadId: t.String({
        minLength: 1,
      }),
      pageId: t.String({
        minLength: 1,
      }),
    }),
  },
)
