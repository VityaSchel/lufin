import Elysia, { t } from 'elysia'
import { nanoid } from 'nanoid'
import { getMaxExpirationTime } from 'src/utils/expiration-time'
import { createUpdatesChannel } from 'src/ws'
import argon2 from 'argon2'
import getDB from '$db'
import type { PendingPageDocument } from '$db/schema/file'

export const uploadRoute = new Elysia().post(
  '/upload',
  async ({ body, set }) => {
    const tooLittleTimeToExpire =
      new Date(body.expiresAt).getTime() < Date.now() + 1 * 1000
    const tooMuchTimeToExpire =
      new Date(body.expiresAt).getTime() > Date.now() + getMaxExpirationTime(0)
    if (tooLittleTimeToExpire || tooMuchTimeToExpire) {
      set.status = 400
      return {
        ok: false,
        error: 'EXPIRY_DATE_INVALID',
      }
    }

    const channelId = createUpdatesChannel()
    const tmpUploadId = nanoid(16)
    const pageId = nanoid(12)
    const deleteToken = nanoid(32)
    const passwordHash = body.password && (await argon2.hash(body.password))

    const db = await getDB()

    await db.collection<PendingPageDocument>('files').insertOne({
      incomplete: true,
      pageId,
      files: [],
      checksum: body.checksum,
      expiresAt: Date.now() + 1000 * 60 * 5, // 5 minutes to upload files
      setExpiresAtTo: body.expiresAt,
      deleteAtFirstDownload: body.deleteAtFirstDownload,
      deleteToken: deleteToken,
      passwordHash: passwordHash ?? null,
      tmpUploadId: tmpUploadId,
      wsChannelId: channelId,
      encrypted: body.encrypted,
    })

    return {
      ok: true,
      websocketChannelId: channelId,
      tmpUploadId,
      links: { download: pageId, delete: deleteToken },
    }
  },
  {
    body: t.Object({
      expiresAt: t
        .Transform(t.Union([t.String(), t.Number()]))
        .Decode((value) => {
          const num = typeof value === 'string' ? Number(value) : value
          if (!Number.isInteger(num) || num <= 0 || num > 33247742400000) {
            throw new Error('Invalid expiresAt value')
          }
          return num
        })
        .Encode((value) => value),

      checksum: t.Optional(
        t.String({
          minLength: 64,
          maxLength: 64,
          pattern: '^[a-f0-9]{64}$',
        }),
      ),

      password: t.Optional(t.String({ minLength: 1, maxLength: 128 })),

      deleteAtFirstDownload: t
        .Transform(t.Union([t.Literal('true'), t.Literal('false')]))
        .Decode((value) => value === 'true')
        .Encode((value) => (value ? 'true' : 'false')),

      encrypted: t
        .Transform(t.Union([t.Literal('true'), t.Literal('false')]))
        .Decode((value) => value !== 'false')
        .Encode((value) => (value ? 'true' : 'false')),
    }),
  },
)
