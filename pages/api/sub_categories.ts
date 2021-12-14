import type { NextApiRequest, NextApiResponse } from 'next'
import { defaultCorsMiddleware } from '../../lib/cors-middleware'
import { getSubCategories } from '../../services/products'

// {"categories":["REFRIGERATED"]}
// {categories: string[]}
type Data = {
  [index: string]: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await defaultCorsMiddleware(req, res)

  const { categories } = req.body

  // #TODO: fix front-end to just send one category, not string[]
  const category = categories.find((c: string) => !!c) || ''

  const sub_categories = await getSubCategories(category)

  console.log('zomg sub_categories:', sub_categories)
  res.status(200).json(sub_categories)
}
