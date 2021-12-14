import type { NextApiRequest, NextApiResponse } from 'next'
import { defaultCorsMiddleware } from '../../lib/cors-middleware'
import { getCategories } from '../../services/products'

type Data = {
  [index: string]: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await defaultCorsMiddleware(req, res)

  const categories = await getCategories()

  res.status(200).json(categories)
}
