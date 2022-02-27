import type { NextApiRequest, NextApiResponse } from 'next'
import { addInventory, addProductToCatalog } from '../../../services/square'

import { LineItem } from '../../../types/supatypes'
import { Product } from '../../../services/supabase/products'
import { defaultCorsMiddleware } from '../../../lib/cors-middleware'
import { definitions } from '../../../types/supabase'
import { getSupabaseServiceRoleClient } from '../../../services/supabase/supabase'
import { logEvent } from '../../../services/supabase/events'

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

const tag = '/api/wholesaleorders/ready-to-import'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await defaultCorsMiddleware(req, res)

  await logEvent({
    tag,
    message: 'handler',
    data: JSON.stringify({
      headers: req.headers,
      url: req.url,
      body: req.body,
    }),
  })

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
  if (error || !wholesaleOrder) {
    await logEvent({
      tag,
      message: 'parseWholesaleOrderData ok:false!',
      level: 'error',
      data: JSON.stringify({
        api_key,
        wholesaleOrder,
        error,
      }),
    })
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
    await logEvent({
      tag,
      message: 'parseWholesaleOrderData ok:false, no jdata!',
      level: 'error',
      data: JSON.stringify({
        api_key,
        wholesaleOrder,
        error,
      }),
    })
    return { ok: false }
  }
  const items = Object.values(jdata.groupedLineItems)

  // const products = items.map((item) => item.product) as Product[]
  await logEvent({
    tag,
    message: `gonna addProductToCatalog products.length: ${items.length}`,
  })

  for await (const item of items) {
    await logEvent({
      tag,
      message: `zomg need to add:',
      ${item.qtyAdjustments}
      ' for item:'
      ${item.description}`,
    })

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
    await logEvent({
      tag,
      message: `eek no product for this item`,
      level: 'warn',
    })
    return
  }
  const { result, variationId } = await addProductToCatalog(product)
  await logEvent({
    tag,
    message: `zomg addProductToCatalog() variationId: ${variationId}`,
    data: JSON.stringify({ result }),
  })
  if (variationId) {
    await logEvent({
      tag,
      message: ` 'gonna addInventory! variationId: ${variationId}, qtyAdjustments: ${qtyAdjustments}`,
    })

    const rez = await addInventory(variationId, qtyAdjustments)
    if (rez?.result.errors) {
      await logEvent({
        tag,
        message: ` 'addInventory  rez.result.errors: ${rez.result.errors}`,
        level: 'warn',
      })
    }

    await logEvent({
      tag,
      message: `addInventory rez`,
      data: JSON.stringify({ rez }),
      level: 'debug',
    })
  }
}
