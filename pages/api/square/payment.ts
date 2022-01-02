import type { NextApiRequest, NextApiResponse } from 'next'
import { defaultCorsMiddleware } from '../../../lib/cors-middleware'

type Data = {
  ok: boolean
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await defaultCorsMiddleware(req, res)

  console.log(
    '[/api/square/payment] req.headers:',
    req.headers,
    'req.url',
    req.url,
    'req.body:',
    req.body
  )

  const reqBody = JSON.stringify(req.body)
  const url = `https://${req.headers.host}${req.url}`
  const signature = `${req.headers['x-square-signature']}`

  const { locationId, sourceId } = req.body

  if (locationId && sourceId) {
    console.log(
      '[/api/square/payment] req.headers: zomg have a locationId and sourceId',
      locationId,
      sourceId
    )
  }

  res.status(200).json({ ok: true })
}
