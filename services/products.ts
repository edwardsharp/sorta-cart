import { definitions } from '../types/supabase'
import { supabase } from './supabase'

export type Product = definitions['products']

export async function getProducts() {
  return await supabase.from<Product>('products').select()
}
