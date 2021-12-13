import { PostgrestError } from '@supabase/supabase-js'
import { definitions } from '../types/supabase'
import { supabase } from './supabase'

export type Product = definitions['products']

export async function getProducts(limit = 1000) {
  return await supabase.from<Product>('products').select().limit(limit)
}

export function getProductsSuspense(limit = 1000) {
  let status = 'pending'
  let result: Product[] //| PostgrestError

  const suspender = supabase
    .from<Product>('products')
    .select()
    .limit(limit)
    .then((products) => {
      if (products.error) {
        status = 'error'
        result = []
      } else {
        status = 'success'
        result = products.data
      }
    })

  return {
    read() {
      if (status === 'pending') {
        throw suspender
      } else if (status === 'error') {
        throw result
      } else if (status === 'success') {
        return result
      }
    },
  }
}
