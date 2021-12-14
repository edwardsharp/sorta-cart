import useSWR from 'swr'
import { definitions } from '../types/supabase'
import { supabase } from './supabase'

export type Product = definitions['products']

export async function getProducts(limit = 1000) {
  const { data: products, error } = await supabase
    .from<Product>('products')
    .select()
    .limit(limit)

  if (error) throw error.message
  return products
}
