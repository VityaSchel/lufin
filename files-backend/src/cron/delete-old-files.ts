import getDB from '../db.js'
import { DBFileMetadata } from '../model/db-file-metadata.js'
import { deleteFileFromR2 } from '../r2.js'

export async function deleteOldFiles() {
  const db = await getDB()
  const msInHour = 1000*60*60
  const gracePeriod = 2*msInHour
  const expirationTime = Date.now()-gracePeriod
  const pages = await db.collection<DBFileMetadata>('files')
    .find({ expiresAt: { $lt: expirationTime } })
    .toArray()
  console.log('Found', pages.length, 'pages that has expired before', new Date(expirationTime).toISOString())
  const pageIDs = pages.map(p => p.pageID)
  await db.collection<DBFileMetadata>('files')
    .deleteMany({ pageID: { $in: pageIDs } })
  const files = pages.map(p => p.files)
    .reduce((prev, curArray) => prev.concat(...curArray), [])
    .filter(f => f.s3fileName !== undefined)
    .map<string>(file => file.s3fileID)
  await Promise.all(files.map(fileId => deleteFileFromR2(fileId)))
  console.log('Deleted', files.length, 'files in', pageIDs.length, 'pages')
  return files.length
}