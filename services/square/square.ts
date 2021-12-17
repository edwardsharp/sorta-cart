import {
  ApiError,
  BatchRetrieveInventoryCountsResponse,
  CatalogObject,
  Client,
  Environment,
  InventoryCount,
  StandardUnitDescription,
} from 'square'

import { isDeepStrictEqual } from 'util'
import crypto from 'crypto'

const {
  SQUARE_ACCESS_TOKEN,
  SQUARE_LOCATION_ID = '',
  SQUARE_SIGNATURE_KEY = '',
} = process.env

export const client = new Client({
  environment:
    process.env.SQUARE_ENV === 'production'
      ? Environment.Production
      : Environment.Sandbox,
  accessToken: SQUARE_ACCESS_TOKEN,
})

const { inventoryApi, catalogApi } = client

async function batchRetrieveInventoryCounts(catalogObjectIds?: string[]) {
  let cursor: string | null = ''
  let totalItems = 0
  let counts: InventoryCount[] = []

  while (cursor !== null) {
    try {
      // ugh, ts can't infer result type when it's in this while loop :/
      const { result }: { result: BatchRetrieveInventoryCountsResponse } =
        await inventoryApi.batchRetrieveInventoryCounts({
          // locationIds: [SQUARE_LOCATION_ID],
          cursor,
          catalogObjectIds,
        })

      if (result.counts) {
        totalItems += result.counts.length || 0
        counts = [...counts, ...result.counts]
      }

      cursor = result.cursor ? result.cursor : null
      // console.log('result.counts.length:', result.counts?.length)
    } catch (error) {
      // if (error instanceof ApiError) {
      //   console.warn(`Errors: ${error.errors}`)
      // } else {
      console.warn('Unexpected Error: ', error)
      // }

      break
    }
  }

  return { totalItems, counts }
}

type CatalogObjectWithQty = CatalogObject & {
  quantity?: number
  standardUnitDescription?: StandardUnitDescription
}

interface Stock {
  name: string
  description: string
  price: number | bigint
  unit: string
  quantity: number
  sku: string
  item_id: string
  variation_id: string
}

async function getMeasurementUnits(products: CatalogObjectWithQty[]) {
  try {
    const measurementUnitIds = products.reduce((acc, product) => {
      if (
        product.itemData?.variations &&
        product.itemData?.variations[0].itemVariationData?.measurementUnitId &&
        !acc.includes(
          product.itemData?.variations[0].itemVariationData?.measurementUnitId
        )
      ) {
        acc.push(
          product.itemData?.variations[0].itemVariationData?.measurementUnitId
        )
      }
      return acc
    }, [] as string[])

    console.log('zomg measurementUnitIds.length!', measurementUnitIds.length)

    const { result: measurementUnitsResult } =
      await catalogApi.batchRetrieveCatalogObjects({
        objectIds: measurementUnitIds,
      })

    return measurementUnitsResult
  } catch (e) {
    // console.warn('getMeasurementUnits caught error!', e)
    return null
  }
}

export async function getProductsInStock(): Promise<CatalogObjectWithQty[]> {
  const { result: catalogInfoResult } = await catalogApi.catalogInfo()
  const standardUnitDescriptions =
    catalogInfoResult.standardUnitDescriptionGroup?.standardUnitDescriptions ||
    []

  const { counts } = await batchRetrieveInventoryCounts()

  const objectIds = counts
    .filter((c) => parseFloat(`${c.quantity}`))
    .reduce((acc, count) => {
      if (count.catalogObjectId) {
        acc.push(count.catalogObjectId)
      }
      return acc
    }, [] as string[])

  if (!objectIds || objectIds.length === 0) {
    console.warn('no products found in square! gonna return')
    return []
  }
  console.log('objectIds.length:', objectIds.length)

  let products: CatalogObjectWithQty[] = []

  const perChunk = 100 // items per chunk

  const chunkedObjectIds = objectIds.reduce((acc, item, index) => {
    const chunkIndex = Math.floor(index / perChunk)
    if (!acc[chunkIndex]) {
      acc[chunkIndex] = [] // start a new chunk
    }
    acc[chunkIndex].push(item)
    return acc
  }, [] as string[][])

  for await (const objectIds of chunkedObjectIds) {
    const { result: variationsResult } =
      await catalogApi.batchRetrieveCatalogObjects({
        objectIds,
      })

    if (variationsResult.objects) {
      // so variations are "type": "ITEM_VARIATION"
      const { result } = await catalogApi.batchRetrieveCatalogObjects({
        // reduce here to handle optionalz
        objectIds: variationsResult.objects.reduce((acc, v) => {
          if (v.itemVariationData?.itemId) {
            acc.push(v.itemVariationData.itemId)
          }
          return acc
        }, [] as string[]),
      })

      if (result.objects) {
        products = [...products, ...result.objects]
      }
    }
  }

  const measurementUnitsResult = await getMeasurementUnits(products)

  return products.map((product) => {
    // so finally back-reference all the inventory counts with each product item varation
    const quantity = product.itemData?.variations?.reduce((acc, v) => {
      const quantity = counts.find((c) => c.catalogObjectId === v.id)?.quantity
      if (!isNaN(parseFloat(`${quantity}`))) {
        acc += parseFloat(`${quantity}`)
      }
      return acc
    }, 0)

    // finally get a lookup table for measurementUnitId
    // so first need to get catalog info (which does have the limits that could inform chunk thing above) ANYWAY
    // standard_unit_description_group > standard_unit_descriptions > {
    //   "unit": {
    //     "weight_unit": "IMPERIAL_WEIGHT_OUNCE",
    //     "type": "TYPE_WEIGHT"
    //   },
    //   "name": "Ounce",
    //   "abbreviation": "oz"
    // }
    // ...okay then when we lookup measurementUnitId (ex AA5LSZVBOTT64UQXCQ6NHF7V) in the catalog we'll get a "type": "MEASUREMENT_UNIT",
    //  measurement_unit_data > weight_unit
    // :/

    let standardUnitDescription: StandardUnitDescription | undefined

    if (
      product.itemData?.variations &&
      product.itemData?.variations[0].itemVariationData?.measurementUnitId
    ) {
      const measurementUnitId =
        product.itemData.variations[0].itemVariationData.measurementUnitId
      const measurementUnitObject = measurementUnitsResult?.objects?.find(
        (o) => o.id === measurementUnitId
      )
      if (measurementUnitObject) {
        standardUnitDescription = standardUnitDescriptions.find((u) =>
          isDeepStrictEqual(
            u.unit,
            measurementUnitObject.measurementUnitData?.measurementUnit
          )
        )
      }
    }

    return { ...product, quantity, standardUnitDescription }
  })
}

export function mapProductsToStock(
  products: CatalogObjectWithQty[]
): Partial<Stock>[] {
  return products.map((product) => {
    const price =
      (product.itemData &&
        product.itemData.variations &&
        product.itemData?.variations[0].itemVariationData?.priceMoney
          ?.amount) ||
      0
    const unit = `${product.standardUnitDescription?.name || 'Each'}`
    const sku =
      product.itemData?.variations &&
      product.itemData.variations[0].itemVariationData?.sku
    const item_id = product.id
    const variation_id =
      product.itemData?.variations && product.itemData.variations[0].id

    return {
      name: product.itemData?.name,
      description: product.itemData?.description,
      price,
      unit,
      quantity: product.quantity,
      sku,
      item_id,
      variation_id,
    }
  })
}

export async function batchRetrieveInventoryChanges(updatedAfter?: string) {
  // updated_after timestamp to come from webhook
  const { result } = await inventoryApi.batchRetrieveInventoryChanges({
    updatedAfter,
  })

  //result.changes
  // so each one of these will be either type= PHYSICAL_COUNT, ADJUSTMENT
  // collect unique list of catalog_object_id (probably only for catalog_object_type:'ITEM_VARIATION'??)
  // and then go and lookup current inventory count for each
  // batchRetrieveInventoryCounts(catalogObjectIds)
  // then update local cache (subabase table prolly)

  // wait, there's a webhook that does this!
  // inventory.count.updated payload:
  /*{
    "merchant_id": "6SSW7HV8K2ST5",
    "type": "inventory.count.updated",
    "event_id": "df5f3813-a913-45a1-94e9-fdc3f7d5e3b6",
    "created_at": "2019-10-29T18:38:45.455006797Z",
    "data": {
      "type": "inventory",
      "id": "84e4ac73-d605-4dbd-a9e5-ffff794ddb9d",
      "object": {
        "inventory_counts": [
          {
            "calculated_at": "2019-10-29T18:38:45.10296Z",
            "catalog_object_id": "FGQ5JJWT2PYTHF35CKZ2DSKP",
            "catalog_object_type": "ITEM_VARIATION",
            "location_id": "YYQR03DGCTXA4",
            "quantity": "10",
            "state": "IN_STOCK"
          }
        ]
      }
    }
  }*/
}

export function validateWebhookSignature(props: {
  reqBody: string
  url: string
  signature: string
}) {
  // example:
  // const body = JSON.stringify(req.body);
  // const signature = req.header('x-square-signature');
  // const url = `https://${req.headers.host}${req.url}`
  const { reqBody, url, signature } = props

  // concat notification URL and JSON body of the webhook notification
  const combined = url + reqBody

  // generate HMAC-SHA1 signature of the string
  // signed with webhook signature key
  // webhook subscription signature key defined on developer.squareup.com
  const hmac = crypto.createHmac('sha1', SQUARE_SIGNATURE_KEY)
  hmac.write(combined)
  hmac.end()
  const checkHash = hmac.read().toString('base64')

  console.log(
    '[validateWebhookSignature] props:',
    props,
    // ' checkHash:',
    // checkHash,
    // ' signature:',
    // signature,
    'success:',
    checkHash === signature
  )

  return checkHash === signature
}
