import getDB from '$db'
import Elysia, { t, NotFoundError } from 'elysia'
import { sendUpdate as sendWsUpdate } from 'src/ws'
import { nanoid } from 'nanoid'
import type { PendingPageDocument } from '$db/schema/file'
import { getMaxExpirationTime } from 'src/utils/expiration-time'

export const finishFilesUploadRoute = new Elysia().post(
  '/upload/:tmpUploadId/finish',
  async ({ params: { tmpUploadId }, set }) => {
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

    const pageFilesSize = page.files.reduce(
      (acc, f) => acc + f.filesizeInBytes,
      0,
    )

    const expiresAt =
      page.setExpiresAtTo ?? Date.now() + getMaxExpirationTime(pageFilesSize)

    await db.collection<PendingPageDocument>('files').updateOne(
      { incomplete: true, tmpUploadId },
      {
        $unset: {
          incomplete: true,
          tmpUploadId: true,
          wsChannelId: true,
          setExpiresAtTo: true,
        },
        $set: {
          authorToken: authorToken,
          downloadsNum: 0,
          expiresAt,
        },
      },
    )

    sendWsUpdate(page.wsChannelId, {
      type: 'upload_success',
      pageId: page.pageId,
      authorToken: authorToken,
      pageExpiresAt: page.expiresAt,
    })

    return { ok: true }
  },
  {
    params: t.Object({
      tmpUploadId: t.String({
        minLength: 1,
      }),
    }),
  },
)
