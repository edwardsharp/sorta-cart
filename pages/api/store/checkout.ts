import type { NextApiRequest, NextApiResponse } from 'next'
import { defaultCorsMiddleware } from '../../../lib/cors-middleware'
import { createOrder, mapLineItems } from '../../../services/square/orders'
import { createPayment } from '../../../services/square/payments'
import { LineItemWithProductData } from '../../../types/supatypes'

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

  const { order, sourceId } = req.body

  if (order) {
    const {
      id,
      history,
      createdAt,
      updatedAt,
      OrderLineItems,
      ...orderToInsert
    } = order

    const lineItems = mapLineItems(OrderLineItems)

    const orderResponse = await createOrder({
      referenceId: `TEST ORDER ${Date.now()}`,
      lineItems,
      name: order.name,
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
      Math.round(order.total * 100)
    )

    // well it should have same result total as incoming total
    // expect(orderResponse?.totalMoney?.amount?.toString()).toBe(
    //   Math.round(TEST_ORDER.total * 100).toString()
    // )

    const orderId =
      orderResponse?.id &&
      orderResponse?.totalMoney?.amount?.toString() ===
        Math.round(order.total * 100).toString()
        ? orderResponse?.id
        : undefined

    if (orderResponse?.id) {
      const amountCents = Math.round(order.total * 100)
      const payment = await createPayment({
        sourceId,
        amountCents,
        orderId,
      })

      console.log('square payment result:', payment)
      res.status(200).json({ ok: true })
      return
    }
  }

  res.status(200).json({ ok: false })
}
