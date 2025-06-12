import { z } from 'zod'
import sjson from 'secure-json-parse'

export type FilesPageLocalStorage = {
  files: { name: string; type: string }[]
  decryptionToken: string
  createdAt: number
  expiresAt: number
  deleteAfterFirstDownload: boolean
  deleteToken: string
  deleted: boolean
  authorToken: string
}

export const schema = z.object({
  files: z.array(z.object({ name: z.string().min(1), type: z.string() })).min(1),
  decryptionToken: z.string(),
  createdAt: z.number().int().positive(),
  expiresAt: z.number().int().positive(),
  deleteAfterFirstDownload: z.boolean(),
  deleteToken: z.string(),
  deleted: z.boolean(),
  authorToken: z.string().min(1)
})

export function saveFilesPage(page: {
  pageId: string
  decryptionToken: string
  files: { name: string; type: string }[]
  expiresAt: Date
  deleteAfterFirstDownload: boolean
  deleteToken: string
  authorToken: string
}) {
  window.localStorage.setItem(
    page.pageId,
    JSON.stringify({
      files: page.files,
      decryptionToken: page.decryptionToken,
      createdAt: Date.now(),
      expiresAt: page.expiresAt.getTime(),
      deleteAfterFirstDownload: page.deleteAfterFirstDownload,
      deleteToken: page.deleteToken,
      deleted: false,
      authorToken: page.authorToken
    } satisfies z.infer<typeof schema> satisfies FilesPageLocalStorage)
  )
  window.dispatchEvent(new Event('storage'))
}

export function loadFilesPages() {
  const keys = Object.keys(window.localStorage)
  const pages: (FilesPageLocalStorage & { pageId: string })[] = []
  for (const key of keys) {
    const data = getItem(key)
    if (data === null) continue
    else pages.push({ pageId: key, ...data })
  }
  return pages
}

export function markFilesPageDeleted(deletePageToken: string) {
  const filePages = loadFilesPages()
  const fp = filePages.find((p) => p.deleteToken === deletePageToken)

  if (fp) {
    const { pageId, ...rest } = fp
    localStorage.setItem(
      pageId,
      JSON.stringify({
        ...rest,
        deleted: true
      } satisfies z.infer<typeof schema> satisfies FilesPageLocalStorage)
    )
    window.dispatchEvent(new Event('storage'))
  }
}

export function getItem(key: string) {
  const rawData = window.localStorage.getItem(key)
  if (rawData === null) return null
  let parsedData
  try {
    parsedData = sjson.parse(rawData)
  } catch (e) {
    return null
  }
  const data = schema.safeParse(parsedData)
  if (!data.success) {
    return null
  } else return data.data
}

export function clearUnavailableFiles() {
  const filesPages = loadFilesPages()
  const unavailableFilesPages = filesPages.filter((fp) => {
    const isExpired = fp.expiresAt < Date.now()
    return fp.deleted || isExpired
  })
  for (const ufp of unavailableFilesPages) {
    window.localStorage.removeItem(ufp.pageId)
    window.dispatchEvent(new Event('storage'))
  }
}

export function updateFilePage(id: string, data: Partial<FilesPageLocalStorage>) {
  const filePage = getItem(id)
  if (filePage === null) return
  const updatedFilePage = { ...filePage, ...data }
  window.localStorage.setItem(id, JSON.stringify(updatedFilePage))
  window.dispatchEvent(new Event('storage'))
}
