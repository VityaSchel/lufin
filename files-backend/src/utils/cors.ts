import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'

export const corsPreHandler = (req: FastifyRequest, res: FastifyReply, done: HookHandlerDoneFunction) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Allow-Headers', '*')

  const isPreflight = /options/i.test(req.method)
  if (isPreflight) {
    return res.send()
  }
      
  done()
}