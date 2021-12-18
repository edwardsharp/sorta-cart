import React from 'react'
import useSWR from 'swr'

import { getStock, Stock } from '../../services/supabase/stock'

export default function StockList() {
  const { data: stock, error } = useSWR('get_stock', () => getStock(1000))

  const columns: Array<keyof Stock> = [
    'variation_id',
    'name',
    'description',
    'price',
    'unit',
    'quantity',
    'sku',
    'item_id',
    'created_at',
  ]

  if (error) return <div>failed to load</div>
  if (!stock) return <div>loading . . .</div>

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
        <div>{stock.length} Stock</div>
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
          {stock.map((product) => (
            <tr key={product.variation_id}>
              {columns.map((col) => (
                <td key={`${product.variation_id}${col}`}>{product[col]}</td>
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
