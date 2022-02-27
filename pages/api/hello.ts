import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  SORTA: 'CART'
  APP_VERSION: string
  'MADE WITH': '♥ in NYC'
}

const APP_VERSION = `v${
  process.env.npm_package_version || require('../../package.json').version
}`

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ SORTA: 'CART', APP_VERSION, 'MADE WITH': '♥ in NYC' })
}
