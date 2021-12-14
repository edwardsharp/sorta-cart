import { getProducts } from './products'

describe('products service', () => {
  test('getProducts matches snapshot', async () => {
    const products = await getProducts(10)
    expect(products).toMatchSnapshot()
  })

  // hmm mock getProducts in the following?
  test('getProducts with no aguments', async () => {
    const products = await getProducts()
    expect(products && products.length).toBeGreaterThanOrEqual(1)
  })

  test('getProducts throws', async () => {
    // note: jest needs whatever fn that throws to be wrapped in a fn, so the lambda here:
    await expect(async () => await getProducts(-1)).rejects.toThrow()
  })
})
