import { Stream } from 'stream'
import { getDownloadStreamFromR2 } from './r2.js'

export async function downloadFile(s3fileID: string): Promise<Stream> {
  return await getDownloadStreamFromR2(s3fileID)
}