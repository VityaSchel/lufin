import { Elysia } from 'elysia'
import cors from '@elysiajs/cors'
import {
  getFilesPageSubrouter,
  PageMiddlewareError,
} from 'src/routes/page/[pageId]'
import { uploadFilesRoute } from 'src/routes/page/upload/[tmpUploadId]'
import { finishFilesUploadRoute } from 'src/routes/page/upload/[tmpUploadId]/finish'
import { deleteFilesPageRoute } from 'src/routes/page'
import { getFilesPageInfoRoute } from 'src/routes/page/[pageId]/info'
import { updatesWebsocketRoute } from 'src/routes/updates/[channelId]'

const app = new Elysia()
  .use(
    cors({
      origin: process.env.CORS_ORIGIN || true,
    }),
  )
  .error({ PageMiddlewareError })
  .onError(({ code, set, error }) => {
    if (code === 'NOT_FOUND') {
      set.status = 404
      return { ok: false, error: 'NOT_FOUND' }
    } else if (code === 'VALIDATION' || code === 'PARSE') {
      set.status = 400
      return { ok: false, error: 'INVALID_REQUEST' }
    } else if (code === 'PageMiddlewareError') {
      set.status = error.status
      return { ok: false, error: error.message }
    } else {
      console.error(error)
      set.status = 500
      return { ok: false, error: 'INTERNAL_SERVER_ERROR' }
    }
  })
  .use(getFilesPageSubrouter)
  .use(uploadFilesRoute)
  .use(finishFilesUploadRoute)
  .use(deleteFilesPageRoute)
  .use(getFilesPageInfoRoute)
  .use(updatesWebsocketRoute)

app.listen(process.env.PORT || 3000, ({ hostname, port }) => {
  console.log(`Server is now listening on ${hostname}:${port}`)
})
