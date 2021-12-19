import React from 'react'
import useSWR from 'swr'

import { getStock } from '../../services/supabase/stock'

export default function StocksCard() {
  const { data: stocks, error } = useSWR('get_stocks_card', getStock)

  if (error) return <div>failed to load</div>
  if (!stocks) return <div>loading...</div>

  return (
    <>
      <h2>In Stock</h2>
      <p>{stocks && stocks.length} products</p>
    </>
  )
}
