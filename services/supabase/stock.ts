import { SupabaseClient } from '@supabase/supabase-js'
import { definitions } from '../../types/supabase'
import { supabase } from './supabase'

export type Stock = definitions['stock']

export async function getStock(limit = 1000) {
  const { data: stock, error } = await supabase
    .from<Stock>('stock')
    .select()
    .limit(limit)

  if (error) throw new Error(error.message)
  return stock
}

export async function findStockItem(variation_id: string) {
  const { data: stock, error } = await supabase
    .from<Stock>('stock')
    .select()
    .eq('variation_id', variation_id)
    .single()

  if (error) throw new Error(error.message)
  return stock
}

// all the functions below are known to need non-anon privileges, so client prop is passed in.
// there might be a better way; this is sort of ad-hoc DI :internet-shrugz:
export async function upsertStock(props: {
  stock: Stock | Stock[]
  client?: SupabaseClient
}) {
  const { client, stock } = props
  const c = client ? client : supabase

  const { data, error } = await c.from('stock').upsert(stock)

  //   if (error) throw new Error(error.message)
  if (error) console.warn('upsertStock caught error:', error.message)
  return data
}

export async function updateStockQuantity(props: {
  variation_id: string
  quantity: number
  client?: SupabaseClient
}) {
  const { variation_id, quantity, client } = props
  const c = client ? client : supabase
  const { data, error } = await c
    .from<Stock>('stock')
    .update({ quantity })
    .match({ variation_id })

  //   if (error) throw new Error(error.message)
  if (error) console.warn('updateStockQuantity caught error:', error)
  return data
}
