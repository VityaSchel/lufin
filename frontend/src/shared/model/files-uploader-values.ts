import type { UploadableFile } from '$shared/uploadable-file'

export type FilesUploaderFormValues = {
  files: null | UploadableFile[]
  password: null | string
  deleteAtFirstDownload: boolean
  encrypt: boolean
} & ({
  convertToZip: true
  zipArchiveName: string | null
} | {
  convertToZip: false
  zipArchiveName: null
})