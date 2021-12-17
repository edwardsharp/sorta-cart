import type { NextApiRequest, NextApiResponse } from 'next'
import { validateWebhookSignature } from '../../../../services/square/square'

type Data = {
  ok: boolean
}
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log(
    '[/api/square/webhooks/inventory-count-updated] req.headers:',
    req.headers,
    'req.url',
    req.url,
    'req.body:',
    req.body
  )

  const reqBody = JSON.stringify(req.body)
  const url = `https://${req.headers.host}${req.url}`
  const signature = `${req.headers['x-square-signature']}`

  validateWebhookSignature({ reqBody, url, signature })

  res.status(200).json({ ok: true })
}
