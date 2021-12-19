import React from 'react'
import useSWR from 'swr'

import { getStock, Stock } from '../../services/supabase/stock'
import styles from '../../styles/Grid.module.css'

function formatPrice(price?: number) {
  if (price === undefined || price === null) {
    return ''
  }
  const f = (price / 100).toFixed(2)
  return `$${f}`
}

export default function StockList() {
  const { data: stock, error } = useSWR('get_stock', () => getStock(1000))

  const columns: Array<keyof Stock> = [
    // 'variation_id',
    'name',
    // 'description',
    'price',
    'unit',
    'quantity',
    // 'sku',
    // 'item_id',
    // 'created_at',
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

      <div className={styles.grid}>
        {stock.map((product) => (
          <div className={styles.card} key={product.variation_id}>
            <p>{product.name}</p>
            <div>
              <h2>{formatPrice(product.price)}</h2>
              <span>{product.unit}</span>
            </div>
            <small>{product.quantity} available</small>
          </div>
        ))}
      </div>
    </>
  )
}
