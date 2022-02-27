import { definitions } from './supabase'

export type Product = definitions['products']
export type LineItem = definitions['OrderLineItems']
export type LineItemWithProductData = Omit<LineItem, 'data' | 'id'> & {
  data: string | { product: Product }
}
export type Order = definitions['Orders']
export type Member = definitions['Members']
export type SupaOrderWithLineItems = Order & {
  OrderLineItems: LineItemWithProductData[]
}
