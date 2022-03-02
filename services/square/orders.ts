import {
  CreateOrderRequest,
  OrderLineItem,
  OrderLineItemDiscount,
  OrderLineItemTax,
} from 'square'

import { LineItemWithProductData } from '../../types/supatypes'
import { client } from './client'
import { getDefaultLocationId } from './locations'
import { randomUUID } from 'crypto'

const { ordersApi } = client

export async function createOrder(props: {
  name?: string
  locationId?: string
  lineItems?: OrderLineItem[]
  taxes?: OrderLineItemTax[]
  discounts?: OrderLineItemDiscount[]
  customerId?: string
  referenceId?: string
  autoApplyDiscounts?: boolean
  autoApplyTaxes?: boolean
}) {
  const { name, lineItems, taxes, discounts, customerId, referenceId } = props

  const locationId = props.locationId
    ? props.locationId
    : await getDefaultLocationId()

  if (!locationId || !lineItems || lineItems.length === 0) {
    console.warn(
      '[services/square/orders] createOrder got no locationId or lineItems! returning null.'
    )
    return null
  }

  const autoApplyDiscounts =
    props.autoApplyDiscounts !== undefined ? props.autoApplyDiscounts : true // default true
  const autoApplyTaxes =
    props.autoApplyTaxes !== undefined ? props.autoApplyTaxes : true // default true

  const fulfillments = [
    {
      type: 'PICKUP',
      state: 'PROPOSED',
      pickupDetails: {
        recipient: {
          displayName: name,
        },
        //Example for 2 days, 12 hours, 30 minutes, and 15 seconds: P2DT12H30M15S
        // or just 7 dayz: P7D    P0DT1H0S P7DT0H0S
        autoCompleteDuration: 'P7D',
        scheduleType: 'SCHEDULED',
        pickupAt: new Date().toISOString(),
        // expiresAt: new Date().toISOString(),
        // note: '',
      },
    },
  ]

  const order: CreateOrderRequest = {
    idempotencyKey: randomUUID(),
    order: {
      locationId,
      referenceId,
      customerId,
      lineItems,
      taxes,
      discounts,
      pricingOptions: {
        autoApplyDiscounts,
        autoApplyTaxes,
      },
      fulfillments,
    },
  }

  try {
    const { result, statusCode } = await ordersApi.createOrder(order)

    // console.log('Square Order created!', { result, statusCode })

    return {
      id: result.order?.id,
      totalMoney: result.order?.totalMoney,
      state: result.order?.state,
      referenceId: result.order?.referenceId,
      result,
    }
  } catch (error) {
    console.warn('oh noz! createOrder threw up! error:', error)

    return {
      id: undefined,
      totalMoney: undefined,
      state: undefined,
      referenceId: undefined,
      result: undefined,
      error,
    }
  }
}

function tryParseJSON(data?: string | object) {
  if (!data) {
    return undefined
  }
  if (typeof data !== 'string') {
    return data
  }
  try {
    return JSON.parse(data)
  } catch (e) {
    return data
  }
}

function toCents(amount?: number | string) {
  const amountInt = parseFloat(`${amount}`)
  if (!isNaN(amountInt)) {
    return BigInt(Math.round(amountInt * 100))
  }
  return BigInt(0)
}
export function mapLineItems(
  line_items: LineItemWithProductData[]
): OrderLineItem[] {
  return line_items
    .filter((li) => li.kind === 'product' || li.kind === 'adjustment')
    .map((li) => {
      const data = tryParseJSON(li.data)
      if (data?.product?.sq_variation_id) {
        // special handling if this is a square product (i.e. there's a sq_variation_id)
        return {
          // note: with catalogObjectId, do not include name!
          quantity: `${li.quantity}`,
          basePriceMoney: {
            amount: toCents(li.price),
            currency: 'USD',
          },
          catalogObjectId: data.product.sq_variation_id,
        }
      }
      return {
        name: li.description || '',
        quantity: `${li.quantity}`,
        basePriceMoney: {
          amount: toCents(li.price),
          currency: 'USD',
        },
      }
    })
}
