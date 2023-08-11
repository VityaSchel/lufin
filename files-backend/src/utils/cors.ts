import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'

const host = process.env.PUBLIC_HOST
if(!host) throw new Error('PUBLIC_HOST env variable is not set')

export function condAddCors(req: FastifyRequest, res: FastifyReply) {
  const origin = req.headers.origin ?? ''
  if (!host) throw new Error('PUBLIC_HOST env variable is not set')
  const isAllowedOrigin = new RegExp(`^https://([a-z0-9-]+\\.)?${host.replace(/\./g, '\\.')}/?$`).test(origin) 
    || /^https?:\/\/localhost:\d+$/.test(origin) 
    || /^https?:\/\/127.0.0.1:\d+$/.test(origin)
  res.header('Access-Control-Allow-Origin', 
    isAllowedOrigin 
      ? origin
      : `https://${host}`
  )
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Allow-Headers', '*')
  return res
}

export const corsPreHandler = (req: FastifyRequest, res: FastifyReply, done: HookHandlerDoneFunction) => {
  condAddCors(req, res)

  const isPreflight = /options/i.test(req.method)
  if (isPreflight) {
    return res.send()
  }
      
  done()
}