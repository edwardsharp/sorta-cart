import { useCallback, useEffect, useState } from 'react'
import { getProducts, Product } from '../../services/products'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])

  const fetchProducts = useCallback(async () => {
    const { data, error } = await getProducts(10)
    if (!error && data && data.length) {
      setProducts(data)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [])
  return (
    <>
      <h2>{products.length} Products</h2>
      {products &&
        products.map((product) => (
          <div key={product.id}>
            <dl>
              {Object.entries(product).map((entry) => (
                <div key={`${product.id}${entry[0]}`}>
                  <dt>{entry[0]}</dt>
                  <dd>{entry[1]}</dd>
                </div>
              ))}
            </dl>
            <hr />
          </div>
        ))}
    </>
  )
}
