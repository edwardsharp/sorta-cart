import React, { useState } from 'react'
import useSWR from 'swr'

import { getProducts, Product } from '../../services/supabase/products'
import { supabase } from '../../services/supabase/supabase'
import styles from '../../styles/Grid.module.css'

function formatPrice(product: Product) {
  if (!product.u_price || !product.ws_price) {
    return ''
  }
  const u_price = parseFloat(`${product.u_price}`).toFixed(2)
  if (product.ws_price === product.u_price) {
    return (
      <>
        <h2>${u_price}</h2>
        <div>
          <i>
            {product.pk && product.pk > 1 ? `${product.pk} pk` : ''}{' '}
            {product.size}
          </i>
        </div>
      </>
    )
  }
  const ws_price = parseFloat(`${product.ws_price}`).toFixed(2)
  return (
    <>
      <h2>${ws_price}</h2>{' '}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <i>
          {product.pk && product.pk > 1 ? `${product.pk} pk` : ''}{' '}
          {product.size}
        </i>
        <i>${u_price} ea.</i>
      </div>
    </>
  )
}

interface ProductsGrouped {
  [index: string]: { [index: string]: Product[] }
}

interface ProductsData {
  grouped: ProductsGrouped
  cats: string[]
  count: number
}

const Grid = (props: { products: ProductsData; error: any }) => {
  const { products, error } = props
  if (error) return <div>failed to load</div>
  if (!products) return <div>loading . . .</div>

  return (
    <>
      {products.cats.map((cat) => (
        <div key={cat}>
          {products.grouped &&
            products.grouped[cat] &&
            Object.keys(products.grouped[cat]).map((sub_cat) => (
              <>
                <div key={sub_cat} className={styles.grid}>
                  <div className={styles.sticky}>
                    <h1>{cat}</h1>
                    <h2>
                      {sub_cat} (
                      {products.grouped &&
                        products.grouped[cat][sub_cat].length}
                      ){' '}
                    </h2>
                  </div>
                  {products.grouped &&
                    products.grouped[cat][sub_cat].map((product) => (
                      <div className={styles.card} key={product.id}>
                        <p>{product.description}</p>
                        <div>{formatPrice(product)}</div>
                        <small>{product.name}</small>
                      </div>
                    ))}
                </div>
              </>
            ))}
        </div>
      ))}
    </>
  )
}

export default function ProductGrid() {
  const [searchQ, setSearchQ] = useState('')
  const { data: products, error } = useSWR(
    { key: 'get_product', searchQ },
    async ({ searchQ: q }) => {
      let query = supabase.from('products').select('*', { count: 'exact' })
      if (q) {
        query = query.textSearch('fts', q, {
          type: 'websearch',
          config: 'english',
        })
      }
      const { data: products, error, count } = await query

      let cats: string[] = []
      const grouped = products?.reduce((acc, product) => {
        const cat = product.category || 'no category'
        if (!acc[cat]) {
          acc[cat] = {}
        }
        if (!cats.includes(cat)) {
          cats.push(cat)
        }
        const sub_cat = product.sub_category || ''
        if (!acc[cat][sub_cat]) {
          acc[cat][sub_cat] = []
        }
        acc[cat][sub_cat].push(product)

        return acc
      }, {} as ProductsGrouped)

      return { grouped, cats, count: count || 0 }
    }
  )

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
        <div>{products && products.count} products</div>
        <div>
          <input
            type="search"
            placeholder="Search"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />

          {/* <button>:)</button> */}
        </div>
      </div>

      {products && <Grid products={products} error={error} />}
    </>
  )
}
