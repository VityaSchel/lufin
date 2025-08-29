import { z } from 'zod'

export const apiUrl = new URL(import.meta.env.VITE_API_URL)

export async function getFilesPage({ pageId, password }: { pageId: string; password?: string }) {
  const res = await fetch(new URL('page/' + pageId, apiUrl), {
    method: 'GET',
    headers: {
      ...(password && { Authorization: password })
    }
  }).then((req) => req.json())
  const page = z
    .discriminatedUnion('ok', [
      z.object({
        ok: z.literal(true),
        encrypted: z.boolean(),
        checksum: z.string().optional(),
        files: z.array(
          z.object({
            filename: z.string(),
            sizeInBytes: z.number().nonnegative(),
            mimeType: z.string()
          })
        )
      }),
      z.object({
        ok: z.literal(false),
        error: z.enum(['NOT_FOUND', 'PAGE_PASSWORD_PROTECTED', 'INVALID_PAGE_PASSWORD'])
      })
    ])
    .parse(res)
  return page
}

export async function streamFileDownload({
  pageId,
  fileIndex,
  password
}: {
  pageId: string
  fileIndex: number
  password?: string
}): Promise<
  { ok: true; size: number; stream: ReadableStream<Uint8Array> } | { ok: false; error: string }
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
    return { ok: false, error: filesResponse.error }
  } else {
    return {
      ok: true,
      size: Number(filesRequest.headers.get('Content-Length')),
      stream: filesRequest.body
    }
  }
}

export async function deleteFilesPage({ deleteToken }: { deleteToken: string }) {
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
