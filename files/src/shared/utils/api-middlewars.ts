import { NextApiRequest, NextApiResponse } from 'next'

type APIHandler = (req: NextApiRequest, res: NextApiResponse) => any

export function withHTTPMethods(methodsHandlers: { [key: string]: APIHandler }): APIHandler {
  return (
    req: NextApiRequest,
    res: NextApiResponse
  ) => {
    if(/*/^[A-Z]+$/.test(req.method) && */Object.hasOwnProperty.bind(methodsHandlers)(req.method as string)) {
      return methodsHandlers[req.method as string](req, res)
    } else {
      // Object.getOwnPropertyNames.bind(methodsHandlers)()
      return res.status(405).json({ ok: false, error: 'METHOD_NOT_SUPPORTED', supportedMethods: Object.keys(methodsHandlers) })
    }
  }
}