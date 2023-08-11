export type FilesPage = {
  pageID: string
  files: {
    s3fileID: string
    filename: string
    filesizeInBytes: number
    mimeType: string
  }[]
  expiresAt: number
  deleteAtFirstDownload: boolean
  deleteToken: string
  passwordHash: string | null
  encrypted: boolean
}