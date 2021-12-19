import React from 'react'
import useSWR from 'swr'

import { getProducts, Product } from '../../services/supabase/products'
import styles from '../../styles/Grid.module.css'

function formatPrice(product: Product) {
  if (!product.u_price || !product.ws_price) {
    return ''
  }
  const u_price = parseFloat(`${product.u_price}`).toFixed(2)
  if (product.ws_price === product.u_price) {
    return <h2>${u_price}</h2>
  }
  const ws_price = parseFloat(`${product.ws_price}`).toFixed(2)
  return (
    <div>
      <h2>${ws_price}</h2> <i>(${u_price} ea.)</i>
    </div>
  )
}

interface ProductsGrouped {
  [index: string]: { [index: string]: Product[] }
}

export default function ProductGrid() {
  const { data: products, error } = useSWR('get_product', async () => {
    const products = await getProducts(1000)
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

    return { grouped, cats, count: products?.length || 0 }
  })

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
        <div>{products.count} products</div>
        <div>
          <input type="search" placeholder="Search" />

          <button>:)</button>
        </div>
      </div>

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
                        <div>
                          {formatPrice(product)}
                          <span>{product.pk}pk</span>
                        </div>
                        <small>{product.name}</small>
                      </div>
                    ))}
                </div>
              </>
            ))}
        </div>
      ))}

      <div className={styles.grid}>
        {/* {products.map((product) => (
          <div className={styles.card} key={product.id}>
            <p>{product.description}</p>
            <p>{product.name}</p>
            <div>
              {formatPrice(product)}
              <span>{product.pk}pk</span>
            </div>
            <small></small>
          </div>
        ))} */}
      </div>
    </>
  )
}
