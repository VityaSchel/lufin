import type { FilesPage } from '../db/schema/file.js'
import _ from 'lodash'
import type mongodb from 'mongodb'

export async function getFilesPageFromDBDirectly(db: mongodb.Db, pageID: string): Promise<FilesPage | null> {
  const page = await db.collection<FilesPage>('files')
    .findOne({ pageID })
  return (page && page.expiresAt > Date.now()) ? _.omit(page, '_id') : null
}

export async function getFilesPage(filesApiURI: string, pageID: string, password?: string) {
  const filesRequest = await fetch(filesApiURI + '/files/' + pageID, {
    method: 'GET',
    headers: {
      'Authorization': password ?? ''
    }
  })
  const filesResponse = await filesRequest.json() as { ok: true, files: { filename: string, sizeInBytes: number, mimeType: string }[] } | { ok: false, error: 'PAGE_NOT_FOUND' | 'PAGE_PASSWORD_PROTECTED' | 'PASSWORD_INVALID' }
  if (!filesResponse.ok) throw new Error(filesResponse.error)
  return filesResponse.files
}

export async function getFileDownloadableStream(filesApiURI: string, pageID: string, fileIndex: number, password?: string): Promise<{ success: true, filesizeInBytes: number, fileStream: ReadableStream<Uint8Array> } | { success: false, error: string }> {
  const filesRequest = await fetch(filesApiURI + `/files/${pageID}/${fileIndex}`, {
    method: 'GET',
    headers: {
      'Authorization': password ?? ''
    }
  })
  if (filesRequest.status !== 200 || filesRequest.body === null) {
    const filesResponse = await filesRequest.json() as { ok: false, error: string }
    return { success: false, error: filesResponse.error }
  } else {
    return {
      success: true,
      filesizeInBytes: Number(filesRequest.headers.get('Content-Length')),
      fileStream: filesRequest.body
    }
  }
}

export async function deleteFilesPage(filesApiURI: string, deleteToken: string) {
  const response = await fetch(filesApiURI + `/files/delete/${deleteToken}`)
  return await response.json() as { ok: boolean }
}