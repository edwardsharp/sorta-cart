import type { NextApiRequest, NextApiResponse } from 'next'
import { defaultCorsMiddleware } from '../../../lib/cors-middleware'
import { addInventory, addProductToCatalog } from '../../../services/square'
import { Product } from '../../../services/supabase/products'
import { getSupabaseServiceRoleClient } from '../../../services/supabase/supabase'
import { definitions } from '../../../types/supabase'
import { LineItem } from '../../../types/supatypes'

interface GroupedItem {
  qtySum: number
  qtyUnits: number
  qtyAdjustments: number
  totalSum: number
  product: Product | undefined
  vendor: string | undefined
  description: string
  line_items: LineItem[]
}

interface LineItemData {
  groupedLineItems: {
    [key: string]: GroupedItem
  }
  orderTotal: number
  productTotal: number
  adjustmentTotal: number
}

export type WholesaleOrder = definitions['WholesaleOrders'] & {
  data: string | LineItemData
}

type Data = {
  ok: boolean
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await defaultCorsMiddleware(req, res)
  console.log(
    '[/api/wholesaleorders/ready-to-import] req.headers:',
    req.headers,
    'req.url',
    req.url,
    'req.body:',
    req.body
  )

  const response = await parseWholesaleOrderData(req.body.api_key)

  res.status(200).json(response)
}

async function parseWholesaleOrderData(api_key?: string): Promise<Data> {
  if (!api_key) {
    return { ok: false }
  }

  const client = getSupabaseServiceRoleClient()
  const { data: wholesaleOrder, error } = await client
    .from<WholesaleOrder>('WholesaleOrders')
    .select('*')
    .eq('api_key', api_key)
    .single()
  console.log('wholesale order?', wholesaleOrder, error)
  if (error || !wholesaleOrder) {
    return { ok: false }
  }

  let jdata: LineItemData | undefined = undefined
  try {
    if (wholesaleOrder.data) {
      jdata = JSON.parse(wholesaleOrder.data) as LineItemData
    }
  } catch (e) {
    jdata = wholesaleOrder.data as LineItemData
  }
  if (!jdata) {
    return { ok: false }
  }
  const items = Object.values(jdata.groupedLineItems)

  // const products = items.map((item) => item.product) as Product[]
  console.log('gonna addProductToCatalog products.length:', items.length)

  for await (const item of items) {
    console.log(
      'zomg need to add:',
      item.qtyAdjustments,
      ' for item:',
      item.description
    )

    const { product, qtyAdjustments } = item
    await addProductAndInventory(product as Product, qtyAdjustments)
  }

  return { ok: true }
}

async function addProductAndInventory(
  product: Product,
  qtyAdjustments: number
) {
  if (!product) {
    console.warn('eek no product for this item')
    return
  }
  const { result, variationId } = await addProductToCatalog(product)
  console.log(
    'zomg addProductToCatalog() variationId, result:',
    variationId
    // result
  )
  if (variationId) {
    console.log(
      'gonna addInventory! variationId, qtyAdjustments:',
      variationId,
      qtyAdjustments
    )
    const rez = await addInventory(variationId, qtyAdjustments)
    if (rez?.result.errors) {
      console.warn('[addInventory] rez.result.errors:', rez.result.errors)
    }
    console.log('addInventory rez', rez)
  }
}
