import { getProductsInStock, mapProductsToStock } from './square'
import fs from 'fs'
import superjson from 'superjson'

// note: this test takes a while:
jest.setTimeout(120000) // 2min

describe('square', () => {
  test('getProductsInStock', async () => {
    const products = await getProductsInStock()
    const stock = mapProductsToStock(products)

    console.log('square getProductsInStock() length:', products.length)

    if (products) {
      fs.writeFileSync('products.json', superjson.stringify(products))

      fs.writeFileSync('stock.json', superjson.stringify(stock))
      console.log('wrote file: products.json, stock.json.')
    } else {
      console.warn('no stock!')
    }
  })
})
