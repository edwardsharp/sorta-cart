import type { NextApiRequest, NextApiResponse } from 'next'
import { createOrder, mapLineItems } from '../../../services/square/orders'
import {
  getOrderForApiKey,
  updateOrderPayment,
} from '../../../services/supabase/orders'

import { LineItemWithProductData } from '../../../types/supatypes'
import { createPayment } from '../../../services/square/payments'
import { defaultCorsMiddleware } from '../../../lib/cors-middleware'
import { getSupabaseServiceRoleClient } from '../../../services/supabase/supabase'

type Data = {
  ok: boolean
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await defaultCorsMiddleware(req, res)

  console.log(
    '[/api/store/checkout] req.headers:',
    req.headers,
    'req.url',
    req.url,
    'req.body:',
    req.body
  )

  const { sourceId, api_key } = req.body

  if (!sourceId || !api_key) {
    res.status(200).json({ ok: false })
    return
  }

  const client = getSupabaseServiceRoleClient()
  const { order, error } = await getOrderForApiKey(api_key, client)

  if (error || !order) {
    res.status(200).json({ ok: false })
    return
  }

  const { name, total: orderTotal, OrderLineItems } = order
  const total = orderTotal || 0

  const { ok, data } = await handleNewOrderAndPayment(
    name || 'no name',
    total,
    OrderLineItems,
    sourceId
  )

  if (ok && data) {
    // update order payment_status and create payment order line item.
    await updateOrderPayment(api_key, { total: total, data }, client)
  }

  res.status(200).json({ ok })
}

async function handleNewOrderAndPayment(
  name: string,
  total: number,
  orderLineItems: LineItemWithProductData[],
  sourceId: string
): Promise<{ ok: boolean; data?: any }> {
  const lineItems = mapLineItems(orderLineItems)

  const orderResponse = await createOrder({
    referenceId: `TEST ORDER ${Date.now()}`,
    lineItems,
    name: name,
  })

  console.log(
    'square createOrder() lineItems:',
    lineItems,
    ' orderResponse:',
    orderResponse
  )

  console.log(
    'response order TOTAL:',
    orderResponse?.totalMoney?.amount?.toString(),
    ' SHOULD MATCH:',
    Math.round(total * 100)
  )

  // well it should have same result total as incoming total
  // #TODO: something meaningful if it's not (cuz the payment will fail)
  // also #TODO: handle no sourceId? like for free or pay-later orders.

  const orderId =
    orderResponse?.id &&
    orderResponse?.totalMoney?.amount?.toString() ===
      Math.round(total * 100).toString()
      ? orderResponse?.id
      : undefined

  if (orderId) {
    const amountCents = Math.round(total * 100)
    const data = await createPayment({
      sourceId,
      amountCents,
      orderId,
    })

    console.log('square payment result:', data)

    return { ok: true, data }
  }

  return { ok: false }
}
