type BasePageDocument = {
  pageId: string
  files: {
    storageId: string
    filename: string
    filesizeInBytes: number
    mimeType: string
  }[]
  checksum: string | null
  expiresAt: Date
  deleteAtFirstDownload: boolean
  deleteToken: string
  passwordHash: string | null
  encrypted: boolean
}

export type PendingPageDocument = BasePageDocument & {
  status: 'pending'
  tmpUploadId: string
  wsChannelId: string
  setExpiresAtTo: Date | null
}

export type PageDocument = BasePageDocument & {
  status: 'complete'
  downloadsNum: 0
  authorToken: string
}
