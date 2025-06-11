import { Db } from 'mongodb'
import { v4 as uuid } from 'uuid'
import getDB from '../db'
import { uploadFile } from '../s3'
import { sendUpdate as sendWsUpdate } from '../ws'
import type { PageDocument } from '../db/schema/file'

export async function uploadFiles({
  pageId,
  wsChannelId,
  files,
}: {
  pageId: string
  wsChannelId: string
  files: { fieldname: string; file: File }[]
}) {
  let db: Db
  try {
    db = await getDB()
  } catch (e) {
    console.error('Error while trying to connect to DB', e)
    sendWsUpdate(wsChannelId, {
      type: 'upload_errored',
      error: 'Could not establish connection with database',
    })
    throw new Error('DB_CONNECTION_ERROR')
  }

  try {
    for (const { fieldname, file } of files) {
      const id = uuid()
      await uploadFile(file, id)
      sendWsUpdate(wsChannelId, {
        type: 'progress',
        fileField: fieldname,
        status: 'SAVED',
      })
      await db.collection<PageDocument>('files').updateOne(
        { pageId },
        {
          $push: {
            files: {
              storageId: id,
              filename: file.name,
              filesizeInBytes: file.size,
              mimeType: file.type,
            },
          },
        },
      )
    }
  } catch (e) {
    console.error(e)
    sendWsUpdate(wsChannelId, {
      type: 'upload_errored',
      error: 'Could not upload file to file storage',
    })
  }
}
