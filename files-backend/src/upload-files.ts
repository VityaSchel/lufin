import { sendUpdate as sendWsUpdate } from './ws.js'
import { File } from './model/file.js'
import getDB from './db.js'
import { Db } from 'mongodb'
import { DBFileMetadata } from './model/db-file-metadata.js'
import { v4 as uuid } from 'uuid'
import sanitizeFilename from 'sanitize-filename'
import { noUpload } from './index.js'
import { uploadFileToR2 } from './r2.js'

export async function uploadFiles(pageID: string, wsChannelID: string, files: File[]) {
  if(noUpload) {
    sendWsUpdate(wsChannelID, 'upload_success', { 
      pageID: 'TEST_NO_UPLOAD',
      authorToken: 'TEST_NO_UPLOAD'
    })
    return
  }

  let db: Db
  try {
    db = await getDB()
  } catch(e) {
    console.error('Error while trying to connect to DB', e)
    sendWsUpdate(wsChannelID, 'upload_errored', { error: 'Could not establish connection with database' })
    throw new Error('DB_CONNECTION_ERROR')
  }

  const s3files: { id: string, name: string }[] = []
  try {
    for(let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileSizeInBytes = Buffer.byteLength(file.content)
      console.log('Uploading file', i, `(length: ${fileSizeInBytes} bytes)`, 'as small file')
      const uploadedS3File = await uploadFile(file)
      s3files.push(uploadedS3File)
      sendWsUpdate(wsChannelID, 'progress', { fileField: file.fieldname, status: 'SAVED' })
    }
  } catch(e) {
    console.error(e)
    sendWsUpdate(wsChannelID, 'upload_errored', { error: 'Could not upload file to file storage' })
  }
  
  const page = await db.collection<DBFileMetadata>('files').findOne({ pageID })
  await db.collection<DBFileMetadata>('files').updateOne({ pageID }, {
    $set: {
      files: [...page!.files, ...s3files.map((uploadedS3File, i) => ({
        s3fileID: uploadedS3File.id,
        s3fileName: uploadedS3File.name,
        filename: files[i].filename,
        filesizeInBytes: files[i].sizeInBytes,
        mimeType: files[i].mimeType
      }))]
    }
  })
  
}

async function uploadFile(file: File) {
  const fn = sanitizeFilename(file.filename)
  const s3fileName = fn ? `${fn}_${uuid()}` : uuid()
  await uploadFileToR2(file.content, s3fileName)
  return { id: s3fileName, name: s3fileName }
}