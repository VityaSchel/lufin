import Elysia, { t, NotFoundError } from 'elysia'
import getDB from '$db'
import argon2 from 'argon2'
import { downloadFile } from 'src/s3'

import type { PageDocument } from '$db/schema/file'

export class PageMiddlewareError extends Error {
  constructor(
    public status: number,
    public message: 'PAGE_PASSWORD_PROTECTED' | 'INVALID_PAGE_PASSWORD',
  ) {
    super(message)
  }
}

export const getFilesPageSubrouter = new Elysia({ prefix: '/page/:pageId' })
  .resolve(async ({ params: { pageId }, headers }) => {
    const db = await getDB()
    const page = await db
      .collection<PageDocument>('files')
      .findOne({ pageId, incomplete: { $ne: true } })
    if (!page || Date.now() > page.expiresAt) {
      throw new NotFoundError()
    }

    const storedPasswordHash = page.passwordHash
    if (storedPasswordHash) {
      const inputPassword = headers.authorization
      if (!inputPassword) {
        throw new PageMiddlewareError(401, 'PAGE_PASSWORD_PROTECTED')
      }

      const isPasswordValid = await argon2.verify(
        storedPasswordHash,
        inputPassword,
      )

      if (!isPasswordValid) {
        throw new PageMiddlewareError(401, 'INVALID_PAGE_PASSWORD')
      }
    }

    return { page }
  })
  .get(
    '/',
    async ({ params: { pageId } }) => {
      const db = await getDB()
      const page = (await db
        .collection<PageDocument>('files')
        .findOne({ pageId, incomplete: { $ne: true } }))!

      return {
        ok: true,
        encrypted: page.encrypted,
        files: page.files.map((f) => ({
          filename: f.filename,
          sizeInBytes: f.filesizeInBytes,
          mimeType: f.mimeType ?? '',
        })),
      }
    },
    {
      params: t.Object({
        pageId: t.String({
          minLength: 1,
        }),
      }),
    },
  )
  .get(
    '/:file',
    async ({ params, set }) => {
      const pageId = params.pageId
      const fileNameOrIndex = params.file

      const db = await getDB()
      const page = (await db
        .collection<PageDocument>('files')
        .findOne({ pageId }))!

      if (page.deleteAtFirstDownload) {
        await db.collection<PageDocument>('files').deleteOne({ pageId })
      } else {
        await db
          .collection<PageDocument>('files')
          .updateOne({ pageId }, { $inc: { downloadsNum: 1 } })
      }

      let file = page.files.find((f) => f.filename === fileNameOrIndex)
      if (!file) {
        const fileIndex = Number(fileNameOrIndex)
        if (
          Number.isSafeInteger(fileIndex) &&
          fileIndex >= 0 &&
          fileIndex < page.files.length
        ) {
          file = page.files[fileIndex]
        }
        if (!file) {
          set.status = 404
          return { ok: false, error: 'FILE_INDEX_INVALID' }
        }
      }

      const fileContentsStream = await downloadFile(file.storageId)

      set.headers['content-type'] = page.encrypted
        ? 'application/octet-stream'
        : (file.mimeType ?? 'application/octet-stream')

      set.headers['content-length'] = file.filesizeInBytes

      return fileContentsStream
    },
    {
      params: t.Object({
        pageId: t.String({
          minLength: 1,
        }),
        file: t.String({
          minLength: 1,
        }),
      }),
    },
  )
