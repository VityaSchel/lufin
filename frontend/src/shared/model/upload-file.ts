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
  type: string
  name: string
  fsOriginalName: string
  content: Blob
  processing?: true
  compressed?: CompressedUploadableFile
}

export type CompressedUploadableFile = {
  content: Blob
  chosen: boolean
}
