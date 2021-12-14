import React from 'react'
import useSWR from 'swr'

import { getProducts } from '../../services/products'

export default function Products() {
  const { data: products, error } = useSWR('get_products', () =>
    getProducts(10)
  )

  if (error) return <div>failed to load</div>
  if (!products) return <div>loading . . .</div>

  return (
    <>
      <h2>{products.length} Products</h2>
      <table>
        <thead>
          {products[0] && (
            <tr>
              {Object.keys(products[0]).map((k) => (
                <td key={`${k}`}>
                  <dd>{k}</dd>
                </td>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              {Object.values(product).map((v) => (
                <td key={`${product.id}${v}`}>
                  <dd>{v}</dd>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
