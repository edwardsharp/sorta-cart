import React from 'react'
import useSWR from 'swr'

import { getProductsCount } from '../../services/supabase/products'

export default function ProductsCard() {
  const { data: count, error } = useSWR('get_products_card', getProductsCount)
  console.log('count, error', count, error)
  if (error) return <div>failed to load</div>
  if (!count) return <div>loading...</div>

  return (
    <>
      <h2>Back Catalog</h2>
      <p>{count} products</p>
    </>
  )
}
