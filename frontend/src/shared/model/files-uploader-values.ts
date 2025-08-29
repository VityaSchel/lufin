export type FilesUploaderFormValues = {
  files: null | UploadableFile[]
  password: null | string
  deleteAtFirstDownload: boolean
  encrypt: boolean
} & (
  | {
      convertToZip: true
      zipArchiveName: string | null
    }
  | {
      convertToZip: false
      zipArchiveName: null
    }
)

export type UploadableFile = {
  id: number
  blob: Blob
  type: string
  initialName: string
  name: string
  altBlob?: Blob
  isCompressedVersion?: boolean
}
