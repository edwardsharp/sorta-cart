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
    '[/api/store/checkout] req.headers:',
    req.headers,
    'req.url',
    req.url,
    'req.body:',
    req.body
  )

  const reqBody = JSON.stringify(req.body)
  const url = `https://${req.headers.host}${req.url}`
  const signature = `${req.headers['x-square-signature']}`

  const { order, nonce } = req.body

  if (order && nonce) {
    console.log(
      '[/api/store/checkout] req.headers: zomg have a locationId and sourceId',
      nonce,
      order
    )
  } else if (order) {
    console.log('[/api/store/checkout] is this a free order?!', order)
  }

  res.status(200).json({ ok: true })
}
