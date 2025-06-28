import { z } from 'zod'

export const apiUrl = new URL(import.meta.env.VITE_API_URL)

export async function getFilesPage(pageId: string, password?: string) {
  const filesRequest = await fetch(new URL('page/' + pageId, apiUrl), {
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
  const filesRequest = await fetch(new URL(`page/${pageId}/${fileIndex}`, apiUrl), {
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
  const response = await fetch(new URL('page', apiUrl), {
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

const limitsSchema = z.array(
  z
    .object({
      limit: z.number().nonnegative(),
      seconds: z.number().int().nonnegative()
    })
    .strict()
)

let cachedLimits: { limit: number; seconds: number }[] | null = null
let getLimitsLock: Promise<z.infer<typeof limitsSchema> | 'error'> | null = null
export async function getLimits() {
  if (cachedLimits !== null) return cachedLimits
  if (!getLimitsLock) {
    getLimitsLock = new Promise(async (resolve) => {
      try {
        const response = await fetch(new URL('limits', apiUrl))
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const limits = limitsSchema.parse(await response.json()).sort((a, b) => a.limit - b.limit)
        cachedLimits = limits
        resolve(limits)
      } catch (error) {
        console.error('Failed to fetch limits:', error)
        resolve('error')
      }
    })
  }
  return getLimitsLock
}
