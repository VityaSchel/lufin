import getDB, { close as closeDb } from '../db'
import type { PageDocument } from '../db/schema/file'
import { deleteFile } from '../s3'

const gracePeriod = process.env.GRACE_PERIOD ? parseInt(process.env.GRACE_PERIOD, 10) : 7200

export async function cleanup() {
  const db = await getDB()
  const expirationTime = Date.now() - (gracePeriod * 1000)

  const pages = await db
    .collection<PageDocument>('files')
    .find({ expiresAt: { $lte: expirationTime } })
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

await cleanup()
await closeDb()
process.exit(0)
