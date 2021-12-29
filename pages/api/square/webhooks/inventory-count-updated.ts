import type { NextApiRequest, NextApiResponse } from 'next'
import {
  addStandardUnitDescription,
  batchRetrieveCatalogObjects,
  batchRetrieveInventoryCounts,
  getProductsInStock,
  mapProductsToStock,
  validateWebhookSignature,
} from '../../../../services/square/square'
import {
  findStockItem,
  updateStockQuantity,
  upsertStock,
} from '../../../../services/supabase/stock'
import { getSupabaseServiceRoleClient } from '../../../../services/supabase/supabase'
import { InventoryCountUpdatedWebhook } from '../../../../types/square'

type Data = {
  ok: boolean
}
export default async function handler(
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

  if (validateWebhookSignature({ reqBody, url, signature })) {
    // process request and try to upsertStock
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

  //   console.log(
  //     '[updateStockLevels] zomggg have ',
  //     catalogObjectIds.length,
  //     ' catalogObjectIds:',
  //     catalogObjectIds,
  //     ' got inventoryCountUpdatedWebhookData:',
  //     inventoryCountUpdatedWebhookData
  //   )
  if (catalogObjectIds.length === 0) {
    // console.log(
    //   'updateStockLevels catalogObjectIds empty (i guess no ITEM_VARIATION types??), returning...'
    // )
    return
  }

  const products = await getProductsInStock(catalogObjectIds)
  const stock = mapProductsToStock(products, false)

  //   console.log(
  //     'zomg  getProductsInStock() length (should be 1):',
  //     products.length
  //   )

  if (stock.length) {
    // console.log(
    //   `gonna try to upsert ${stock.length} stock items to supabase...`,
    //   stock
    // )
    const client = getSupabaseServiceRoleClient()
    await upsertStock({ client, stock })
  }
}
