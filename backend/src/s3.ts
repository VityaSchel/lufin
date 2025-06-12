import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { getStreamAsBuffer } from 'get-stream'
import { Readable } from 'stream'

const bucket = process.env.S3_BUCKET
if (
  !process.env.S3_ENDPOINT ||
  !process.env.S3_ACCESS_KEY ||
  !process.env.S3_SECRET_ACCESS_KEY ||
  !bucket
) {
  throw new Error(
    'Fill S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_ACCESS_KEY, S3_BUCKET in .env file',
  )
}

const s3 = new S3Client({
  region: process.env.S3_REGION || undefined,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
})

export async function getObject(r2FileName: string) {
  const command = new HeadObjectCommand({
    Bucket: bucket,
    Key: r2FileName,
  })

  return await s3.send(command)
}

export async function downloadFile(r2FileName: string): Promise<Buffer> {
  const stream = await getDownloadStream(r2FileName)
  return await getStreamAsBuffer(stream)
}

export async function getDownloadStream(r2FileName: string) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: r2FileName,
  })

  const { Body } = await s3.send(command)
  if (Body instanceof Readable) {
    return Body as Readable
  } else {
    throw new Error('Expected body to be a stream')
  }
}

export async function uploadFile(file: File, fileName: string) {
  const uploadRequest = new Upload({
    client: s3,
    params: {
      Bucket: bucket,
      Key: fileName,
      Body: file,
      ...(file.type && {
        ContentType: file.type,
      }),
    },
    partSize: 5 * 1024 * 1024,
    queueSize: 4,
  })
  return await uploadRequest.done()
}

export async function deleteFile(fileName: string) {
  return await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: fileName,
    }),
  )
}
