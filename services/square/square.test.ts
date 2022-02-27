import { getProductsInStock, mapSqCatalogToProducts } from './square'

import fs from 'fs'
import superjson from 'superjson'

// note: this test takes a while:
jest.setTimeout(120000) // 2min

describe('square', () => {
  test('getProductsInStock', async () => {
    const catalog = await getProductsInStock()
    const products = await mapSqCatalogToProducts(catalog)

    console.log(
      'square getProductsInStock() catalog, products length:',
      catalog.length,
      products.length
    )

    if (products) {
      fs.writeFileSync('catalog.json', superjson.stringify(catalog))

      fs.writeFileSync('products.json', superjson.stringify(products))
      console.log('wrote file: catalog.json, products.json.')
    } else {
      console.warn('no stock!')
    }
  })
})
