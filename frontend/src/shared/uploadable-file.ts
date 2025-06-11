export type UploadableFile = {
  id: number
  blob: Blob
  type: string
  initialName: string
  name: string
  altBlob?: Blob
  isCompressedVersion?: boolean
}