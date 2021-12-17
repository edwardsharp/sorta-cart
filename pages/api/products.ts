import type { NextApiRequest, NextApiResponse } from 'next'

import { defaultCorsMiddleware } from '../../lib/cors-middleware'
import { getProducts, Product } from '../../services/supabase/products'

type Data = {
  data: Product[] | null
  page: number
  totalCount: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await defaultCorsMiddleware(req, res)

  const products = await getProducts()

  res.status(200).json({ data: products, page: 0, totalCount: 1000 })
}
