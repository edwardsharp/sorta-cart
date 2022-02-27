#!/usr/bin/env ts-node

import dotenv from 'dotenv'
import path from 'path'

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
}

import superjson from 'superjson'

import { addProductToCatalog } from '../../services/square'

const main = async () => {
  // gawd need to delete UGXILB5H64X7C5NDPOEJDR2W and D4IGOKEF6P4QJO4EEP26K2DP
  // const deleteRes = await batchDeleteCatalogObjects([
  //   'UGXILB5H64X7C5NDPOEJDR2W',
  //   'D4IGOKEF6P4QJO4EEP26K2DP',
  // ])
  // console.log('deleteRes:', deleteRes)

  // console.log('gonna fetchTaxes')
  // const fetchTaxesResult = await fetchTaxes()
  // console.log(
  //   'fetchTaxesResult.result:',
  //   fetchTaxesResult.result,
  //   superjson.stringify(fetchTaxesResult.result)
  // )

  // console.log('gonna fetchMeasurementUnits')
  // const fetchMeasurementUnitsResult = await fetchMeasurementUnits()
  // console.log(
  //   'fetchMeasurementUnitsResult.result:',
  //   fetchMeasurementUnitsResult.result,
  //   superjson.stringify(fetchMeasurementUnitsResult.result)
  // )

  // console.log('gonna fetchCustomAttributes')
  // const customAttributesRes = await fetchCustomAttributes()
  // console.log(
  //   'customAttributesRes.result:',
  //   customAttributesRes.result,
  //   superjson.stringify(customAttributesRes.result)
  // )
  // const mapProductResult = await mapProductToCustomAttributeValues(
  //   exampleProduct
  // )
  // console.log('mapProductResult:', mapProductResult)
  // const searchCatalogResult = await searchCatalog(exampleProduct.id)
  // console.log(
  //   'zomg searchCatalogResult:',
  //   searchCatalogResult,
  //   superjson.stringify(searchCatalogResult)
  // )

  const exampleProduct = {
    unf: '68851',
    upc_code: '093966307542',
    category: "ALBERT'S FRESH",
    sub_category: 'MEATS',
    name: 'ORGANIC PRAIRIE',
    pk: 8,
    size: '12 oz',
    unit_type: 'CS',
    ws_price: 58.91,
    u_price: 7.36,
    ws_price_cost: 58.91,
    u_price_cost: 7.36,
    codes: '2, g',
    vendor: "albert's fresh",
    import_tag: 'albertz',
    createdAt: '2021-01-02T00:59:46.649+00:00',
    updatedAt: '2021-01-02T00:59:46.649+00:00',
    // count_on_hand: null,
    no_backorder: false,
    // plu: null,
    id: '68851__0-93966-30754-2',
    description_orig:
      'Turkey, Ground, Extra Lean, Gluten-Free, Frozen, Organic Prairie',
    // description_edit: null,
    description:
      'Turkey, Ground, Extra Lean, Gluten-Free, Frozen, Organic Prairie',
  }

  console.log('gonna addProductToCatalog()')
  const result = await addProductToCatalog(exampleProduct)
  console.log(
    'zomg addProductsToCatalog() result:',
    result,
    superjson.stringify(result)
  )
}

main()
