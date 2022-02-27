import type { NextApiRequest, NextApiResponse } from 'next'
import {
  getProductsInStock,
  mapSqCatalogToProducts,
  validateWebhookSignature,
} from '../../../../services/square/square'

import { InventoryCountUpdatedWebhook } from '../../../../types/square'
import { getSupabaseServiceRoleClient } from '../../../../services/supabase/supabase'
import { logEvent } from '../../../../services/supabase/events'
import { upsertProducts } from '../../../../services/supabase/products'

type Data = {
  ok: boolean
}

const tag = '/api/square/webhooks/inventory-count-updated'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await logEvent({
    tag,
    message: 'handler',
    data: JSON.stringify({
      headers: req.headers,
      url: req.url,
      body: req.body,
    }),
  })

  const reqBody = JSON.stringify(req.body)
  const url = `https://${req.headers.host}${req.url}`
  const signature = `${req.headers['x-square-signature']}`

  if (validateWebhookSignature({ reqBody, url, signature })) {
    // process request and try to add stock
    // data > object > inventory_counts
    /*"catalog_object_id": "PQ45SJVXHXJHXWZQCN2RPHCY",
          "catalog_object_type": "ITEM_VARIATION",
          "location_id": "D2MV0BZC6EV9Y",
          "quantity": "56",*/

    const inventoryCountUpdatedWebhookData =
      req.body as InventoryCountUpdatedWebhook

    await updateStockLevels(inventoryCountUpdatedWebhookData)
  }

  res.status(200).json({ ok: true })
}

async function updateStockLevels(
  inventoryCountUpdatedWebhookData: InventoryCountUpdatedWebhook
) {
  const inventory_counts =
    inventoryCountUpdatedWebhookData.data.object.inventory_counts || []
  const catalogObjectIds = inventory_counts.reduce((acc, c) => {
    if (c.catalog_object_type === 'ITEM_VARIATION' && c.state === 'IN_STOCK') {
      acc.push(c.catalog_object_id)
    }
    return acc
  }, [] as string[])

  if (catalogObjectIds.length === 0) {
    await logEvent({
      tag,
      message:
        'updateStockLevels catalogObjectIds empty (i guess no ITEM_VARIATION types??), returning...',
      level: 'warn',
    })
    return
  }

  const catalog = await getProductsInStock(catalogObjectIds)
  const products = await mapSqCatalogToProducts(catalog)

  if (products.length) {
    await logEvent({
      tag,
      message: `gonna try to upsert ${products.length} products (from catalogObjectIds.length: ${catalogObjectIds.length}) to supabase...`,
      data: JSON.stringify({ products, inventoryCountUpdatedWebhookData }),
      level: 'debug',
    })
    const client = getSupabaseServiceRoleClient()
    await upsertProducts({ client, products })
  } else {
    await logEvent({
      tag,
      message: 'getProductsInStock() length is not 1!',
      level: 'warn',
    })
  }
}
