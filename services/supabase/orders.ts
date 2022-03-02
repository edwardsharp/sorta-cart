import { LineItem, Order, SupaOrderWithLineItems } from '../../types/supatypes'

import { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from './supabase'

export async function getOrderForApiKey(
  api_key: string,
  client?: SupabaseClient
) {
  const c = client ? client : supabase

  const { error, data } = await c
    .from<SupaOrderWithLineItems>('Orders')
    .select('*, OrderLineItems ( * )')
    .eq('api_key', api_key)
    .single()

  if (error) {
    console.warn('getOrderForApiKey error!', error)
  }

  return { order: data, error }
}

export async function updateOrderPayment(
  api_key: string,
  payment: { total: number; data: any },
  client?: SupabaseClient
) {
  const c = client ? client : supabase
  const { error, data: order } = await c
    .from<Order>('Orders')
    .update({ payment_status: 'paid' }, { returning: 'representation' })
    .eq('api_key', api_key)
    .single()

  if (!error && order && order.id) {
    const total = -payment.total

    const { error, data } = await c.from<LineItem>('OrderLineItems').insert({
      quantity: 1,
      total,
      description: 'SQUARE CARD PAYMENT',
      kind: 'payment',
      data: payment.data,
      OrderId: order.id,
    })
  }
}
