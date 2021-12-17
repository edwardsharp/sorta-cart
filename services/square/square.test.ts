import { getProductsInStock } from './square'
import fs from 'fs'
import superjson from 'superjson'

// note: this test takes a while:
jest.setTimeout(120000) // 2min

describe('square', () => {
  test('getProductsInStock', async () => {
    const products = await getProductsInStock()

    console.log('square getProductsInStock() length:', products.length)

    if (products) {
      fs.writeFileSync('products.json', superjson.stringify(products))

      fs.writeFileSync(
        'stock.json',
        superjson.stringify(
          products.map((product) => {
            const price =
              (product.itemData &&
                product.itemData.variations &&
                product.itemData?.variations[0].itemVariationData?.priceMoney
                  ?.amount) ||
              0
            const unit = `${product.standardUnitDescription?.name || ''}`
            return {
              name: product.itemData?.name,
              price,
              unit,
              quantity: product.quantity,
            }
          })
        )
      )
      console.log('wrote file: products.json, stock.json.')
    }
  })
})
