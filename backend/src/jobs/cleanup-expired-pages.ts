import getDB, { close as closeDb } from '../db'
import type { PageDocument } from '../db/schema/file'
import { deleteFile } from '../s3'

export async function deleteOldFiles() {
  const db = await getDB()
  const hour = 1000 * 60 * 60
  const gracePeriod = 2 * hour
  const expirationTime = Date.now() - gracePeriod

  const pages = await db
    .collection<PageDocument>('files')
    .find({ expiresAt: { $lt: expirationTime } })
    .toArray()

  console.log(
    'Found',
    pages.length,
    'pages that had expired before',
    new Date(expirationTime).toISOString(),
  )

  const result = await db
    .collection<PageDocument>('files')
    .deleteMany({ pageId: { $in: pages.map((p) => p.pageId) } })
  const files = await Promise.all(
    pages.flatMap((p) => p.files).map((file) => deleteFile(file.storageId)),
  )

  console.log('Deleted', files.length, 'files in', result.deletedCount, 'pages')

  return files.length
}

await deleteOldFiles()
await closeDb()
process.exit(0)
