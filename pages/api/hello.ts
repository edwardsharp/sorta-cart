import type { NextApiRequest, NextApiResponse } from 'next'

import { logEvent } from '../../services/supabase/events'

type Data = {
  SORTA: 'CART'
  APP_VERSION: string
  'MADE WITH': '♥ in NYC'
}

const APP_VERSION = `v${
  process.env.npm_package_version || require('../../package.json').version
}`

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await logEvent({
    tag: 'api/hello',
    message: 'hello world!',
    data: JSON.stringify({ headers: req.headers }),
  })
  res.status(200).json({ SORTA: 'CART', APP_VERSION, 'MADE WITH': '♥ in NYC' })
}
