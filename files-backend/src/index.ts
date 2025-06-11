import Fastify from 'fastify'
import fastifyWebsocket from '@fastify/websocket'
import fastifyMultipart from '@fastify/multipart'
import { 
  PostStartUpload,
  PostUpload,
  PostFinishUpload,
  GetFiles,
  GetPageFile,
  DeleteFiles,
  GetFilesBasicInfo
} from './web-server-routes'
import { WebsocketHandler } from './ws'
import { corsPreHandler } from './utils/cors'

const args = process.argv.slice(2)
if(args.includes('--help') || args.includes('-h')) {
  console.log('USAGE:   npm run start -- [options]')
  console.log('Options:')
  console.log('         --help (-h) — display help manual')
  console.log('         --no-upload — do not save uploaded files to storage')
  process.exit(0)
}
const noUpload = args.includes('--no-upload')
if(noUpload) {
  console.warn('WARN: Backend is running with --no-upload flag, no uploaded files will be saved')
}
export { noUpload }

const fastify = Fastify()
fastify.register(fastifyWebsocket)
fastify.addHook('preHandler', corsPreHandler)
fastify.register(fastifyMultipart, {
  limits: {
    fieldNameSize: 100,
    fieldSize: 100,
    fields: 100*2+2,
    fileSize: 1000*1000*100,
    files: 100,
    headerPairs: 2000,
  }
})

fastify.post('/upload', PostStartUpload)
fastify.post('/upload/:tmpUploadID', PostUpload)
fastify.post('/upload/:tmpUploadID/finish', PostFinishUpload)
fastify.get('/page/:pageID', GetFiles)
fastify.get('/page/:pageID/:file', GetPageFile)
fastify.delete('/page', DeleteFiles)
fastify.get('/page/:pageID/info', GetFilesBasicInfo)

fastify.setErrorHandler((error, req, reply) => {
  if(error.code === 'FST_ERR_CTP_INVALID_MEDIA_TYPE') {
    reply.code(400).send({ ok: false, error: 'UNSUPPORTED_CONTENT_TYPE' })
  } else if(error.code === 'FST_REQ_FILE_TOO_LARGE') {
    console.error('Files are too big')
    reply.code(413).send({ ok: false, error: 'FILES_ARE_TOO_BIG' })
  } else {
    console.error(error)
    reply.code(500).send({ ok: false, error: 'INTERNAL_SERVER_ERROR' })
  }
})
const port = process.env.PORT ? Number(process.env.PORT) : 3000

fastify.register((instance) => {
  instance.get('/updates/:channelID', { websocket: true }, WebsocketHandler)
})

fastify.listen({ port }, (err, address) => {
  if (err) throw err
  console.log(`Server is now listening on ${address}`)
})