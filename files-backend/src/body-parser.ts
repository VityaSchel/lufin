import { Readable } from 'stream'
import { FastifyRequest } from 'fastify'
import { File } from './model/file.js'

const createReadableStream = (buffer) => {
  const readableInstanceStream = new Readable({
    read() {
      for (const bytes of buffer) {
        this.push(bytes)
      }
      this.push(null)
    },
  })
  return readableInstanceStream
}

export async function parseBody(request: FastifyRequest): Promise<{ body: Record<string, string>, files: File[] }> {
  const body = new Map() as Map<string, string>
  const files: File[] = []
  const mimeTypes = new Map() as Map<string, string>

  const parts = request.parts()
  for await (const part of parts) {
    if (part.type === 'file') {
      if(part.file.truncated) throw new Error('File was truncated')
      const chunks: any[] = []
      part.file.on('data', data => chunks.push(data))
      await new Promise(resolve => part.file.on('end', resolve))
      const stream = createReadableStream(chunks)
      const buf = await stream2buffer(stream)
      const sizeInBytes = buf.byteLength
      if(sizeInBytes === 0) continue
      files.push({
        fieldname: part.fieldname,
        content: buf,
        filename: part.filename,
        sizeInBytes: sizeInBytes,
        mimeType: part.mimetype
      })
    } else {
      if(body.has(part.fieldname)) throw new Error('Body field name duplicated')
      if(typeof part.value === 'string') {
        if(/^.+_type$/.test(part.fieldname) && part.value.length < 100 && /\w+\/[-.\w]+(?:\+[-.\w]+)?/.test(part.value)) {
          mimeTypes.set(part.fieldname, part.value)
        } else {
          body.set(part.fieldname, part.value)
        }
      }
    }
  }

  for(const [k, v] of mimeTypes.entries()) {
    const file = files.find(f => f.fieldname === k.substring(0, k.length - '_type'.length)) 
    if(file) {
      file.mimeType = v
    }
  }

  return { body: Object.fromEntries(body), files }
}

async function stream2buffer(stream: Readable): Promise<Buffer> {
  return new Promise <Buffer> ((resolve, reject) => {
    const buffer = Array<any>()
    stream.on('data', chunk => buffer.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(buffer)))
    stream.on('error', err => reject(`error converting stream - ${err}`))
  })
} 