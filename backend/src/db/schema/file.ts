type BasePageDocument = {
  pageId: string
  files: {
    storageId: string
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

export type PendingPageDocument = BasePageDocument & {
  incomplete: true
  tmpUploadId: string
  wsChannelId: string
  setExpiresAtTo: number
}

export type PageDocument = BasePageDocument & {
  downloadsNum: 0
  authorToken: string
}
