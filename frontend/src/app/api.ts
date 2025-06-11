import _ from 'lodash'
import { z } from 'zod'

export async function getFilesPage(pageId: string, password?: string) {
  const filesRequest = await fetch(import.meta.env.VITE_API_URL + '/page/' + pageId, {
    method: 'GET',
    headers: {
      ...(password && { Authorization: password })
    }
  })
  const filesResponse = (await filesRequest.json()) as
    | {
        ok: true
        encrypted: boolean
        checksum?: string
        files: { filename: string; sizeInBytes: number; mimeType: string }[]
      }
    | { ok: false; error: 'NOT_FOUND' | 'PAGE_PASSWORD_PROTECTED' | 'INVALID_PAGE_PASSWORD' }
  return filesResponse
}

export async function getFileDownloadableStream(
  pageId: string,
  fileIndex: number,
  password?: string
): Promise<
  | { success: true; filesizeInBytes: number; fileStream: ReadableStream<Uint8Array> }
  | { success: false; error: string }
> {
  const filesRequest = await fetch(import.meta.env.VITE_API_URL + `/page/${pageId}/${fileIndex}`, {
    method: 'GET',
    headers: {
      ...(password && { Authorization: password })
    }
  })
  if (filesRequest.status !== 200 || filesRequest.body === null) {
    const filesResponse = z
      .object({
        ok: z.boolean(),
        error: z.string()
      })
      .parse(await filesRequest.json())
    return { success: false, error: filesResponse.error }
  } else {
    return {
      success: true,
      filesizeInBytes: Number(filesRequest.headers.get('Content-Length')),
      fileStream: filesRequest.body
    }
  }
}

export async function deleteFilesPage(deleteToken: string) {
  const response = await fetch(import.meta.env.VITE_API_URL + '/page', {
    method: 'DELETE',
    headers: {
      Authorization: deleteToken
    }
  })
  return await z
    .object({
      ok: z.boolean()
    })
    .parse(await response.json())
}
