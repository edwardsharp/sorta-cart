import React from 'react'
import useSWR from 'swr'

import { getProducts } from '../../services/products'

export default function Products() {
  const { data: products, error } = useSWR('get_products', () =>
    getProducts(10)
  )

  if (error) return <div>failed to load</div>
  if (!products) return <div>loading...</div>

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
