import { definitions } from './supabase'

export type Product = definitions['products']
export type LineItem = definitions['OrderLineItems']
export type LineItemWithProductData = Omit<LineItem, 'data' | 'id'> & {
  data: string | { product: Product }
}
