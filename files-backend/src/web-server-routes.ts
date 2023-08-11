import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { parseBody } from './body-parser.js'
import { uploadFiles } from './upload-files.js'
import contentTypeParser from 'content-type'
import { createUpdatesChannel } from './ws.js'
import argon2 from 'argon2'
import getDB from './db.js'
import { DBFileMetadata, DBFilesPageIncomplete } from './model/db-file-metadata.js'
import { downloadFile } from './download-file.js'
import { getMaxExpirationTime, getMaxFilesSize } from './utils/expiration-time.js'
import { nanoid } from 'nanoid'
import { sendUpdate as sendWsUpdate } from './ws.js'
import { deleteFileFromR2 } from './r2.js'

const schema = z.object({
  expiresAt: z.coerce.number()
    .int()
    .positive()
    .max(33247742400000),
  password: z.string()
    .min(1)
    .max(128)
    .optional(),
  deleteAtFirstDownload: z.enum(['true', 'false']).transform((value) => value === 'true'),
  encrypted: z.enum(['true', 'false']).optional().transform((value) => value !== 'false')
})
export async function PostStartUpload(request: FastifyRequest, reply: FastifyReply) {
  const ct = request.headers['content-type']
  if(typeof ct !== 'string' || contentTypeParser.parse(ct).type !== 'application/json') {
    reply.code(400).send({ ok: false, error: 'UNSUPPORTED_CONTENT_TYPE' })
    return 
  }
  const result = schema.safeParse(request.body)
  if(!result.success) {
    reply.code(400).send({ ok: false, error: 'INVALID_BODY_SCHEMA', validationError: result.error })
    return 
  }

  const body = result.data
  
  if(new Date(body.expiresAt).getTime() < (Date.now() + 60*1000)) {
    console.error('Too little time to expire')
    reply.code(400).send({ ok: false, error: 'EXPIRY_DATE_INVALID' })
    return
  } else if(new Date(body.expiresAt).getTime() > Date.now() + getMaxExpirationTime(0)) {
    console.error('Too much time to expire', new Date(body.expiresAt).getTime(), Date.now() + getMaxExpirationTime(0))
    reply.code(400).send({ ok: false, error: 'EXPIRY_DATE_INVALID' })
    return
  }

  const channelID = createUpdatesChannel()
  const tmpUploadID = nanoid(16)
  const pageID = nanoid(12)
  const deleteToken = nanoid(32)
  const passwordHash = body.password && await argon2.hash(body.password)

  const db = await getDB()
  
  await db.collection<DBFilesPageIncomplete>('files').insertOne({
    incomplete: true,
    pageID: pageID,
    files: [],
    expiresAt: body.expiresAt,
    deleteAtFirstDownload: body.deleteAtFirstDownload,
    deleteToken: deleteToken,
    passwordHash: passwordHash ?? null,
    tmpUploadID: tmpUploadID,
    wsChannelID: channelID,
    encrypted: body.encrypted
  })

  reply.send({ ok: true, websocketChannelID: channelID, tmpUploadID, links: { download: pageID, delete: deleteToken } })
}

export async function PostUpload(request: FastifyRequest<{ Params: { tmpUploadID: unknown } }>, reply: FastifyReply) {
  const ct = request.headers['content-type']
  if(typeof ct !== 'string' || contentTypeParser.parse(ct).type !== 'multipart/form-data') {
    reply.code(400).send({ ok: false, error: 'UNSUPPORTED_CONTENT_TYPE' })
    return 
  }

  if(typeof request.params.tmpUploadID !== 'string') {
    reply.code(400).send({ ok: false, error: 'INCORRECT_TMP_UPLOAD_ID' })
    return
  }

  try {
    const parseResult = await parseBody(request)
    const files = parseResult.files
    if(files.length === 0) {
      reply.code(400).send({ ok: false, error: 'INVALID_BODY_SCHEMA', validationError: 'You must pass at least one file' })
      return
    }

    const db = await getDB()

    const page = await db.collection<DBFilesPageIncomplete>('files').findOne({
      incomplete: true,
      tmpUploadID: request.params.tmpUploadID
    })

    if(page === null) {
      reply.code(400).send({ ok: false, error: 'INCORRECT_TMP_UPLOAD_ID' })
      return
    }

    if(page.deleteAtFirstDownload && page.files.length > 1) {
      reply.code(400).send({ ok: false, error: 'NO_MORE_FILES' })
      return
    } else if(page.files.length+files.length > 100) {
      reply.code(400).send({ ok: false, error: 'NO_MORE_FILES' })
      return
    }

    if(page.expiresAt < Date.now()) {
      reply.code(400).send({ ok: false, error: 'LINK_EXPIRED' })
      return
    }

    const maxFilesSize = Math.min(100*1000*1000, getMaxFilesSize(page.expiresAt - Date.now()))

    const sumNewFileSizeBytes = files.reduce((prev, file) => prev + file.content.byteLength, 0)
    const sumExistingFileSizeBytes = page.files.reduce((prev, file) => prev + file.filesizeInBytes, 0)
    if(sumNewFileSizeBytes + sumExistingFileSizeBytes > maxFilesSize) {
      console.error('Files are bigger than 100 MB')
      reply.code(413).send({ ok: false, error: 'FILES_ARE_TOO_BIG' })
      return
    }

    await uploadFiles(page.pageID, page.wsChannelID, files)

    reply.code(200).send({ ok: true })
  } catch(e) {
    if(e instanceof Error) {
      switch(e.message) {
        case 'File was truncated':
          reply.code(400).send({ ok: false, error: 'FILE_TRUNCATED' })
          break
        case 'Body field name duplicated':
          reply.code(400).send({ ok: false, error: 'BODY_FIELD_DUPLICATE' })
          break
        default:
          throw e
      }
    } else {
      console.error(e)
      reply.code(500).send({ ok: false, erorr: 'INTERNAL_SERVER_ERROR' })
      return
    }
  }
}

export async function PostFinishUpload(request: FastifyRequest<{ Params: { tmpUploadID: unknown } }>, reply: FastifyReply) {
  const tmpUploadID = request.params.tmpUploadID
  if(typeof tmpUploadID !== 'string') {
    reply.code(400).send({ ok: false, error: 'INCORRECT_TMP_UPLOAD_ID' })
    return
  }

  const db = await getDB()

  const page = await db.collection<DBFilesPageIncomplete>('files').findOne({
    incomplete: true,
    tmpUploadID
  })

  if(page === null) {
    reply.code(400).send({ ok: false, error: 'INCORRECT_TMP_UPLOAD_ID' })
    return
  }

  if(Number(page.files?.length) < 1) {
    reply.code(400).send({ ok: false, error: 'NO_FILES_UPLOADED' })
    return
  }

  const authorToken = nanoid(32)

  await db.collection<DBFileMetadata>('files').updateOne({ pageID: page.pageID }, {
    $unset: { incomplete: true, tmpUploadID: true, wsChannelID: true },
    $set: {
      authorToken: authorToken,
      downloadsNum: 0
    }
  })
  
  sendWsUpdate(page.wsChannelID, 'upload_success', {
    pageID: page.pageID,
    authorToken: authorToken
  })
  
  reply.code(200).send({ ok: true })
}

class MiddlewareError extends Error {
  code: number
  error: string

  constructor({ code, error }: { code: number, error: string }) {
    super()
    this.code = code
    this.error = error
  }
}

export async function GetFiles(request: FastifyRequest<{ Params: { pageID: unknown } }>, reply: FastifyReply) {
  try { await getPageMiddleware(request) } catch(e) {
    if(e instanceof MiddlewareError) {
      reply.code(e.code).send({ ok: false, error: e.error })
      return
    } else throw e
  }

  const pageIdParsing = z.string().min(1).safeParse(request.params.pageID)
  if(!pageIdParsing.success) {
    reply.code(400).send({ ok: false, error: 'PAGE_ID_INVALID' })
    return
  }
  
  const db = await getDB()
  const page = (await db.collection<DBFileMetadata>('files')
    .findOne({ pageID: pageIdParsing, incomplete: { $ne: true } }))!
  
  reply.send({ ok: true, files: page.files.map(f => ({
    filename: f.filename,
    sizeInBytes: f.filesizeInBytes,
    mimeType: f.mimeType ?? ''
  })) })
}

export async function GetPageFile(request: FastifyRequest<{ Params: { pageID: unknown, file: unknown } }>, reply: FastifyReply) {
  const fileNameOrIndex = request.params.file
  const pageIdParsing = z.string().min(1).safeParse(request.params.pageID)
  if(!pageIdParsing.success) {
    reply.code(400).send({ ok: false, error: 'PAGE_ID_INVALID' })
    return
  }

  try { await getPageMiddleware(request) } catch(e) {
    if(e instanceof MiddlewareError) {
      reply.code(e.code).send({ ok: false, error: e.error })
      return
    } else throw e
  }

  const db = await getDB()
  const page = (await db.collection<DBFileMetadata>('files')
    .findOne({ pageID: pageIdParsing.data }))!

  if(page.deleteAtFirstDownload) {
    await db.collection<DBFileMetadata>('files')
      .deleteOne({ pageID: pageIdParsing.data })
  } else {
    await db.collection<DBFileMetadata>('files')
      .updateOne({ pageID: pageIdParsing.data }, { $inc: { downloadsNum: 1 } })
  }


  let file = page.files.find(f => f.filename === fileNameOrIndex)
  if(!file) {
    const fileIndex = Number(fileNameOrIndex)
    if (Number.isSafeInteger(fileIndex) && fileIndex >= 0 && fileIndex < page.files.length) {
      file = page.files[fileIndex]
    }
    if(!file) {
      reply.code(400).send({ ok: false, error: 'FILE_INDEX_INVALID' })
      return
    }
  }

  const fileContentsStream = await downloadFile(file.s3fileID)

  return reply
    .header('Content-Type', page.encrypted ? 'application/octet-stream' : (file.mimeType ?? 'application/octet-stream'))
    .header('Content-Length', file.filesizeInBytes)
    .code(200)
    .send(fileContentsStream)
}

export async function DeleteFiles(request: FastifyRequest<{ Params: { deleteToken: unknown } }>, reply: FastifyReply) {
  const deleteToken = request.params.deleteToken
  if(typeof deleteToken !== 'string') { throw new MiddlewareError({ code: 403, error: '' }) }
  const db = await getDB()
  const page = await db.collection<DBFileMetadata>('files')
    .findOneAndDelete({ deleteToken, incomplete: { $ne: true } })
  if(page.value) {
    const s3files = page.value.files.map(f => ({ id: f.s3fileID, name: f.s3fileName }))
    if(s3files.every(f => f.name !== undefined)) {
      await Promise.all(s3files.map(f => deleteFileFromR2(f.id)))
    }
    reply.send({ ok: true })
  } else {
    reply.code(404).send({ ok: false, error: 'DELETE_TOKEN_INCORRECT' })
    return
  }
}

export async function GetFilesBasicInfo(request: FastifyRequest<{ Params: { pageID: unknown } }>, reply: FastifyReply) {
  const pageIdParsing = z.string().min(1).safeParse(request.params.pageID)
  if (!pageIdParsing.success) { 
    reply.code(200).send({ ok: true, exists: false })
    return
  }
  const auth = request.headers['authorization']
  if(!z.string().min(1).safeParse(auth).success) {
    reply.code(403).send({ ok: false, error: 'TOKEN_INCORRECT' })
    return
  }
  const db = await getDB()
  const filesPage = await db.collection<DBFileMetadata>('files')
    .findOne({ pageID: pageIdParsing.data })
  if(!filesPage) {
    reply.code(200).send({ ok: true, exists: false })
    return
  }
  if(filesPage.authorToken === auth) {
    reply.code(200).send({ ok: true, exists: true, downloads: filesPage.downloadsNum, expiresAt: filesPage.expiresAt })
    return
  } else {
    reply.code(403).send({ ok: false, error: 'TOKEN_INCORRECT' })
    return
  }
}

async function getPageMiddleware(request: FastifyRequest<{ Params: { pageID: unknown } }>) {
  const pageID = request.params.pageID
  if(typeof pageID !== 'string') { throw new MiddlewareError({ code: 403, error: '' }) }
  const db = await getDB()
  const page = await db.collection<DBFileMetadata>('files').findOne({ pageID, incomplete: { $ne: true } })
  if(!page || Date.now() > page.expiresAt) { 
    throw new MiddlewareError({ code: 404, error: 'PAGE_NOT_FOUND' })
  }
  
  const pagePasswordHash = page.passwordHash
  const specifiedPassword = request.headers.authorization
  if(pagePasswordHash) {
    if(specifiedPassword) {
      const isValid = await argon2.verify(pagePasswordHash, specifiedPassword)
      if(!isValid) { 
        throw new MiddlewareError({ code: 401, error: 'PASSWORD_INVALID' }) 
      }
    } else { 
      throw new MiddlewareError({ code: 401, error: 'PAGE_PASSWORD_PROTECTED' }) 
    }
  }
}
