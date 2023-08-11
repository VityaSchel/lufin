import { getFilesPage } from '@/_app/lib/server-utils'
import { SharedFileForDownload } from '@/shared/model/shared-file'
import { withHTTPMethods } from '@/shared/utils/api-middlewars'
import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

export type PostRequestFilesResponse = { 
  ok: false, 
  error: 'PAGE_NOT_FOUND' | 'PASSWORD_INCORRECT' | 'INVALID_BODY' | 'INTERNAL_ERROR'
} | {
  ok: true
  files: SharedFileForDownload[]
}

export async function PostHandler(
  req: NextApiRequest,
  res: NextApiResponse<PostRequestFilesResponse>,
) {
  const bodyParseResult = z.object({
    pageID: z.string().min(1).max(32),
    password: z.string().min(0).max(128)
  }).safeParse({
    pageID: req.query.pageID,
    password: req.headers.authorization
  })
  if(!bodyParseResult.success) return res.status(400).json({ ok: false, error: 'INVALID_BODY' })

  try {
    const filesPage = await getFilesPage(`https://${process.env.NEXT_PUBLIC_FILES_API_HOSTPORT}`, bodyParseResult.data.pageID, bodyParseResult.data.password)
    res.status(200).json({
      ok: true,
      files: filesPage.map(file => ({
        name: file.filename,
        sizeInBytes: file.sizeInBytes,
        mimeType: file.mimeType
      }))
    })
    return
  } catch(e) {
    if(e instanceof Error) {
      if(e.message === 'PAGE_NOT_FOUND') {
        res.status(404).json({ ok: false, error: 'PAGE_NOT_FOUND' })
        return
      } else if(e.message === 'PAGE_PASSWORD_PROTECTED' || e.message === 'PASSWORD_INVALID') {
        res.status(401).json({ ok: false, error: 'PASSWORD_INCORRECT' })
        return
      } else {
        console.error(e)
        res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' })
        return
      }
    } else {
      throw e
    }
  }
}

export default withHTTPMethods({ 'POST': PostHandler })