export type DBFilesPageIncomplete = Omit<DBFileMetadata, 'authorToken' | 'downloadsNum'> & {
  incomplete: true
  tmpUploadID: string
  wsChannelID: string
}

export type DBFileMetadata = {
  pageID: string
  files: {
    s3fileID: string
    s3fileName?: string
    filename: string
    filesizeInBytes: number
    mimeType: string
  }[]
  expiresAt: number
  deleteAtFirstDownload: boolean
  deleteToken: string
  passwordHash: string | null
  downloadsNum: 0
  authorToken: string
  encrypted: boolean
}