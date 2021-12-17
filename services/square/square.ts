import {
  ApiError,
  BatchRetrieveInventoryCountsResponse,
  CatalogObject,
  Client,
  Environment,
  InventoryCount,
  StandardUnitDescription,
} from 'square'

const { SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID = '' } = process.env

export const client = new Client({
  environment: Environment.Production,
  // process.env.NODE_ENV === 'production'
  //   ? Environment.Production
  //   : Environment.Sandbox,
  accessToken: SQUARE_ACCESS_TOKEN,
})

const { inventoryApi, catalogApi } = client

async function batchRetrieveInventoryCounts() {
  let cursor: string | null = ''
  let totalItems = 0
  let counts: InventoryCount[] = []

  while (cursor !== null) {
    try {
      // ugh, ts can't infer result type when it's in this while loop :/
      const { result }: { result: BatchRetrieveInventoryCountsResponse } =
        await inventoryApi.batchRetrieveInventoryCounts({
          locationIds: [SQUARE_LOCATION_ID],
          cursor,
        })

      if (result.counts) {
        totalItems += result.counts.length || 0
        counts = [...counts, ...result.counts]
      }

      cursor = result.cursor ? result.cursor : null
      // console.log('result.counts.length:', result.counts?.length)
    } catch (error) {
      if (error instanceof ApiError) {
        console.warn(`Errors: ${error.errors}`)
      } else {
        console.warn('Unexpected Error: ', error)
      }

      break
    }
  }

  return { totalItems, counts }
}

type CatalogObjectWithQty = CatalogObject & {
  quantity?: number
  standardUnitDescription?: StandardUnitDescription
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

  console.log('zomg measurementUnitIds.length!', measurementUnitIds)

  const { result: measurementUnitsResult } =
    await catalogApi.batchRetrieveCatalogObjects({
      objectIds: measurementUnitIds,
    })

  return products.map((product) => {
    // so finally back-reference all the inventory counts with each product item varation
    const quantity = product.itemData?.variations?.reduce((acc, v) => {
      const quantity = counts.find((c) => c.catalogObjectId === v.id)?.quantity
      if (!isNaN(parseFloat(`${quantity}`))) {
        acc += parseFloat(`${quantity}`)
      }
      return acc
    }, 0)

    // so finally is to get a lookup table for measurementUnitId
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
      const measurementUnitObject = measurementUnitsResult.objects?.find(
        (o) => o.id === measurementUnitId
      )
      if (measurementUnitObject) {
        standardUnitDescription = standardUnitDescriptions.find(
          (u) =>
            JSON.stringify(u.unit) ===
            JSON.stringify(
              measurementUnitObject.measurementUnitData?.measurementUnit
            )
        )
      }
    }

    return { ...product, quantity, standardUnitDescription }
  })
}
