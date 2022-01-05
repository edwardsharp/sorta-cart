import superjson from 'superjson'
import fs from 'fs'

import { LineItemWithProductData } from '../../types/supatypes'
import { createOrder, mapLineItems } from './orders'
import { createPayment } from './payments'

const TEST_ORDER = {
  status: 'new',
  payment_status: 'balance_due',
  shipment_status: 'backorder',
  total: 60.36,
  item_count: 4,
  subtotal: 56.73,
  name: 'edwardsharp',
  email: 'edward@edwardsharp.net',
  phone: '666-999-6969',
  address: '666 Devel Dr.',
  notes: 'oh hey! dis test',
  UserId: '80a32a8a-5ad0-4d5d-9ba5-75bdcdb54407',
  MemberId: 16,
  OrderLineItems: [
    {
      quantity: 3,
      total: 10.5,
      selected_unit: 'EA',
      price: 3.5,
      description: 'MARSH Kitchen Bread, Rye/caraway',
      kind: 'product',
      vendor: 'MARSH Kitchen',
      data: {
        product: {
          unf: null,
          upc_code: 'MKSRDGHRYE',
          category: 'MARSH',
          sub_category: 'BAKED GOODS',
          name: 'MARSH Kitchen',
          pk: 1,
          size: '1.5lb loaf',
          unit_type: 'EA',
          ws_price: 3.5,
          u_price: 3.5,
          ws_price_cost: 3.5,
          u_price_cost: 3.5,
          codes: '2',
          vendor: 'MARSH Kitchen',
          import_tag: 'marshkitchen0',
          createdAt: '2021-01-02T01:03:44.612+00:00',
          updatedAt: '2021-01-02T01:11:25.399+00:00',
          count_on_hand: 1,
          no_backorder: false,
          plu: null,
          id: '__MKSRDGHRYE',
          description_orig: 'Bread, Rye/caraway',
          description_edit: null,
          description: 'Bread, Rye/caraway',
          featured: false,
          sq_variation_id: null,
        },
      },
      id: 27,
    },
    {
      quantity: 2,
      total: 5.16,
      selected_unit: 'EA',
      price: 2.58,
      description: 'MARSH Kitchen SAME PRICE THING',
      kind: 'product',
      vendor: 'MARSH Kitchen',
      data: {
        product: {
          unf: null,
          upc_code: 'MKCHGT',
          category: 'MARSH',
          sub_category: 'DAIRY',
          name: 'MARSH Kitchen',
          pk: 1,
          size: '8 oz',
          unit_type: 'EA',
          ws_price: 2.58,
          u_price: 2.58,
          ws_price_cost: 2.58,
          u_price_cost: 2.58,
          codes: null,
          vendor: 'MARSH Kitchen',
          import_tag: 'marsh same price',
          createdAt: '2021-01-08T05:38:21.19+00:00',
          updatedAt: '2021-01-08T05:39:21.298+00:00',
          count_on_hand: 10,
          no_backorder: false,
          plu: null,
          id: '__MKCHGT',
          description_orig: 'SAME PRICE THING',
          description_edit: null,
          description: 'SAME PRICE THING',
          featured: false,
          sq_variation_id: null,
        },
      },
      id: 28,
    },
    {
      quantity: 1,
      total: 34.41,
      selected_unit: 'CS',
      price: 34.41,
      description: 'RICELAND Rice, White, Extra Long Grain, Riceland',
      kind: 'product',
      vendor: "albert's fresh",
      data: {
        product: {
          unf: '81370',
          upc_code: '8-06040-00283-3',
          category: "ALBERT'S FRESH",
          sub_category: 'BULK',
          name: 'RICELAND',
          pk: 50,
          size: 'lbs',
          unit_type: 'CS',
          ws_price: 34.41,
          u_price: 0.69,
          ws_price_cost: 34.41,
          u_price_cost: 0.69,
          codes: null,
          vendor: "albert's fresh",
          import_tag: 'albertz',
          createdAt: '2021-01-02T00:59:46.649+00:00',
          updatedAt: '2021-01-02T00:59:46.649+00:00',
          count_on_hand: null,
          no_backorder: false,
          plu: null,
          id: '81370__8-06040-00283-3',
          description_orig: 'Rice, White, Extra Long Grain, Riceland',
          description_edit: null,
          description: 'Rice, White, Extra Long Grain, Riceland',
          featured: false,
          sq_variation_id: null,
        },
      },
      id: 29,
    },
    {
      description: 'DONATION',
      quantity: 1,
      price: 6.66,
      total: 6.66,
      kind: 'adjustment',
      id: 30,
    },
    { kind: 'tax', description: '6.391%', quantity: 1, total: 3.63 },
  ],
}

describe('square', () => {
  test('createOrder', async () => {
    const lineItems = mapLineItems(
      TEST_ORDER.OrderLineItems as unknown as LineItemWithProductData[] // ugh :/
    )

    const orderResponse = await createOrder({
      referenceId: `TEST ORDER ${Date.now()}`,
      lineItems,
      name: TEST_ORDER.name,
    })

    console.log(
      'square createOrder() lineItems:',
      lineItems,
      ' orderResponse:',
      orderResponse
    )

    fs.writeFileSync('orderResponse.json', superjson.stringify(orderResponse))
    console.log('wrote file: orderResponse.json')

    console.log(
      'response order TOTAL:',
      orderResponse?.totalMoney?.amount?.toString(),
      ' SHOULD MATCH:',
      Math.round(TEST_ORDER.total * 100)
    )

    expect(orderResponse?.totalMoney?.amount?.toString()).toBe(
      Math.round(TEST_ORDER.total * 100).toString()
    )
    // it('should have same result total as incoming total')
    const orderId =
      orderResponse?.id &&
      orderResponse?.totalMoney?.amount?.toString() ===
        Math.round(TEST_ORDER.total * 100).toString()
        ? orderResponse?.id
        : undefined

    if (orderResponse?.id) {
      const amountCents = Math.round(TEST_ORDER.total * 100)
      const payment = await createPayment({
        sourceId: 'cnon:card-nonce-ok',
        amountCents,
        orderId,
      })

      console.log('square payment result:', payment)
    }
  })
})
