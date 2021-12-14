import React from 'react'
import useSWR from 'swr'

import { getProducts, Product } from '../../services/products'

export default function Products() {
  const { data: products, error } = useSWR('get_products', () =>
    getProducts(1000)
  )

  const columns: Array<keyof Product> = [
    'category',
    'sub_category',
    'description',
    'pk',
    'size',
    'unit_type',
    'ws_price',
    'u_price',
    'codes',
    'count_on_hand',
  ]

  if (error) return <div>failed to load</div>
  if (!products) return <div>loading . . .</div>

  return (
    <>
      <div
        style={{
          height: 60,
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 1,
          margin: '0 1em',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>{products.length} Products</div>
        <div>
          <input type="search" placeholder="Search" />

          <button>:)</button>
        </div>
      </div>
      <table style={{ margin: '0 1em' }}>
        <thead>
          <tr
            style={{
              position: 'sticky',
              top: 50,
              background: 'white',
              zIndex: 1,
            }}
          >
            {columns.map((col) => (
              <td key={`${col}`}>{col}</td>
            ))}
            <td>&nbsp;</td>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              {columns.map((col) => (
                <td key={`${product.id}${col}`}>{product[col]}</td>
              ))}
              <td>
                <button>+</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
