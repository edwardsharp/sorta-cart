import cors, { CorsOptions, CorsOptionsDelegate } from 'cors'
import { NextApiRequest, NextApiResponse } from 'next'

// helper method to wait for a middleware to execute before continuing
// and to throw an error when an error happens in a middleware
// see: https://nextjs.org/docs/api-routes/api-middlewares
function initMiddleware(middleware: typeof cors) {
  return (
    req: NextApiRequest,
    res: NextApiResponse,
    options?: CorsOptions | CorsOptionsDelegate
  ) =>
    new Promise((resolve, reject) => {
      middleware(options)(req, res, (result: Error | unknown) => {
        if (result instanceof Error) {
          return reject(result)
        }

        return resolve(result)
      })
    })
}

export const corsMiddleware = initMiddleware(cors)

export async function defaultCorsMiddleware(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return corsMiddleware(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  })
}
