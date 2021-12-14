import { getProducts } from './products'

describe('products service', () => {
  test('getProducts', async () => {
    const products = await getProducts(10)
    expect(products).toMatchSnapshot()
  })
})
