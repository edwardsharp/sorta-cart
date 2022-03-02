import Handlebars from 'handlebars/dist/cjs/handlebars'
import { SupaOrderWithLineItems } from '../types/supatypes'
import { getOrderForApiKey } from '../services/supabase/orders'
import { getSupabaseServiceRoleClient } from '../services/supabase/supabase'

const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
})

const printTemplate = `
<style>
  .order {
    margin-bottom: 50px;
    padding: 1em;
    page-break-after: always;
    font-family: sans-serif;
  }

  th,
  b {
    font-variant: small-caps;
  }

  table {
    border: thin solid black;
    border-collapse: collapse;
    width: 100%;
  }

  table tbody tr.li td,
  td.total {
    border-bottom: thin solid black;
  }

  tr td:first-child,
  tr th:first-child {
    padding-left: 1em;
  }

  tr td:last-child,
  tr th:last-child {
    padding-right: 1em
  }

  thead tr:first-child th {
    padding-top: 1em;
  }

  tbody tr:last-child td {
    padding-bottom: 1em;
  }

  .header {
    padding-bottom: 0.5em;
  }

  .divider {
    padding: 1em 0 0.5em 0;
  }

  .left-border {
    border-left: thin solid black;
  }

  .bottom-border {
    border-bottom: thin solid black;
  }

  .gray-bg {
    background: #ededed;
  }

  .date {
    font-size: 0.75em;
    font-style: italic;
  }

  pre {
    white-space: pre-wrap;
  }

  @media print {
    body {
      margin: 0;
      padding: 0;
    }

    .order {
      margin: 0;
      padding: 0
    }

    table {
      font-size: 14px;
    }

    .noprint {
      display: none;
    }
  }
</style>

{{#each orders}}
<div class="order">
  <table>
    <thead>
      <tr>
        <th align="left" class="header" colspan="2">ORDER #{{id}}</th>
        <th align="right" colspan="4" class="left-border gray-bg">MARSH COOP</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <b>status</b>
        </td>
        <td>{{status}}</td>
        <td align="right" colspan="4" class="left-border gray-bg">6917 S. Broadway</td>
      </tr>
      <tr>
        <td>
          <b>payment</b>
        </td>
        <td>{{payment_status}}</td>
        <td align="right" colspan="4" class="left-border gray-bg">St. Louis, MO 63111</td>
      </tr>
      <tr>
        <td>
          <b>shipment</b>
        </td>
        <td>{{shipment_status}}</td>
        <td align="right" colspan="4" class="left-border bottom-border gray-bg header">
          marshcoop.org <br>
          <a href="https://marshlife-art.org/marsh-food-cooperative-schedule/" target="_blank"
            rel="noopener noreferrer" class="noprint">Order Delivery Schedule</a>
        </td>
      </tr>

      {{#if User}}
      <tr>
        <td colspan="6">
          <b>created by</b>
          <span class="date">{{User.email}} ({{User.role}})</span>
        </td>
      </tr>
      {{/if}}

      <tr>
        <td colspan="6">
          <b>created at</b>
          <span class="date">{{createdAt}}</span>
        </td>
      </tr>

      <tr>
        <td colspan="6" class="divider"><b>CUSTOMER</b></td>
      </tr>
      <tr>
        <td><b>name</b></td>
        <td>{{name}}</td>
        <td colspan="4"><b>notes</b></td>
      </tr>
      <tr>
        <td><b>email</b></td>
        <td>{{email}}</td>
        <td colspan="4" rowspan="3">
          <pre>{{notes}}</pre>
        </td>
      </tr>
      <tr>
        <td><b>phone</b></td>
        <td>{{phone}}</td>
      </tr>
      <tr>
        <td><b>address</b></td>
        <td>{{address}}</td>
      </tr>

      <tr>
        <th colspan="6" align="left" class="divider">LINE ITEMS ({{item_count}})</th>
      </tr>

      <tr>
        <th align="left">vendor</th>
        <th>description</th>
        <th align="left">qty</th>
        <th align="center">unit</th>
        <th align="right">price</th align="right">
        <th align="right">total</th>
      </tr>

      {{#if onHandProducts}}
      <tr>
        <td colspan="6" align="left" class="divider bottom-border">On Hand</td>
      </tr>
      {{#each onHandProducts}}
      <tr class="li">
        <td align="center">{{vendor}}</td>
        <td>{{description}}</td>
        <td align="left">{{quantity}}</td>
        <td align="center">{{selected_unit}}</td>
        <td align="right">{{price}}</td>
        <td align="right">{{total}}</td>
      </tr>
      {{/each}}
      {{/if}}

      {{#if backorderProducts.length}}
      <tr>
        <td colspan="6" align="left" class="divider bottom-border">Backordered</td>
      </tr>
      {{#each backorderProducts}}
      <tr class="li">
        <td align="center">{{vendor}}</td>
        <td>{{description}}</td>
        <td align="left">{{quantity}}</td>
        <td align="center">{{selected_unit}}</td>
        <td align="right">{{price}}</td>
        <td align="right">{{total}}</td>
      </tr>
      {{/each}}
      {{/if}}

      <tr>
        <td colspan="5"></td>
        <td align="center" class="total left-border"><b>SUBTOTAL</b></td>
      </tr>
      <tr>
        <td colspan="5" class="bottom-border"></td>
        <td align="right" class="left-border bottom-border"><b>{{subtotal}}</b></td>
      </tr>

      {{#each_when OrderLineItems "kind" "adjustment"}}
      <tr class="li">
        <td align="center">{{vendor}}</td>
        <td>{{description}}</td>
        <td align="left">{{quantity}}</td>
        <td align="center">{{selected_unit}}</td>
        <td align="right">{{price}}</td>
        <td align="right">{{total}}</td>
      </tr>
      {{/each_when}}

      {{#each_when OrderLineItems "kind" "tax"}}
      <tr class="li">
        <td align="center">{{vendor}}</td>
        <td>{{description}}</td>
        <td colspan="3"></td>
        <td align="right">{{total}}</td>
      </tr>
      {{/each_when}}

      {{#each_when OrderLineItems "kind" "payment"}}
      <tr class="li">
        <td align="center">{{vendor}}</td>
        <td>{{description}}</td>
        <td align="left">{{quantity}}</td>
        <td align="center">{{selected_unit}}</td>
        <td align="right">{{price}}</td>
        <td align="right">{{total}}</td>
      </tr>
      {{/each_when}}

      {{#each_when OrderLineItems "kind" "credit"}}
      <tr class="li">
        <td colspan="2">{{description}}</td>
        <td align="left">{{quantity}}</td>
        <td></td>
        <td align="right">{{price}}</td>
        <td align="right">{{total}}</td>
      </tr>
      {{/each_when}}

      {{#if ../balanceDue}}
      <tr>
        <td colspan="2" align="right">
          <b>Balance Due </b>
        </td>
        <td colspan="3" align="center">
          <a href="https://www.marshcoop.org/order/{{id}}" target="_blank" rel="noopener noreferrer">Click here to
            view order and make a payment.</a>
        </td>
        <td align="right">
          <b>{{../balance}}</b>
        </td>
      </tr>
      {{/if}}

      <tr>
        <td colspan="5"></td>
        <td align="center" class="total left-border"><b>TOTAL</b></td>
      </tr>
      <tr>
        <td colspan="5"></td>
        <td align="right" class="left-border"><b>{{total}}</b></td>
      </tr>
    </tbody>
  </table>
</div>
{{/each}}
`
Handlebars.registerHelper(
  'each_when',
  function (list: any, k: any, v: any, opts: any) {
    let i,
      result = ''
    for (i = 0; i < list.length; ++i)
      if (list[i][k] == v) result = result + opts.fn(list[i])
    return result
  }
)

const template = Handlebars.compile(printTemplate)

function orderEmailTemplate(order: SupaOrderWithLineItems) {
  const line_items = order.OrderLineItems || []

  const onHandProducts = line_items.filter(
    (li) => li.kind === 'product' && li.status === 'on_hand'
  )
  const backorderProducts = line_items.filter(
    (li) => li.kind === 'product' && li.status !== 'on_hand'
  )

  const payments = line_items.filter((li) => li.kind === 'payment')
  const paymentsTotal = payments.reduce(
    (acc, v) => acc + parseFloat(`${v.total}`),
    0
  )
  const credits = line_items.filter((li) => li.kind === 'credit')
  const creditsTotal = credits.reduce(
    (acc, v) => acc + parseFloat(`${v.total}`),
    0
  )
  const balance =
    parseFloat(`${order.total}`) +
    parseFloat(`${creditsTotal}`) +
    parseFloat(`${paymentsTotal}`)
  const balanceDue = balance > 0

  // uh, yeah, so this probably doesn't need to be an array,
  // just lazy copy/pasta from sorta-cart-admin's printOrders
  // #TODO: improve this at some point :shrug:
  const orders = [
    {
      ...order,
      onHandProducts,
      backorderProducts,
    },
  ]

  return template({ orders, balance, balanceDue })
}

export async function emailOrderReceipt(order_api_key?: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    if (process.env.NODE_ENV === 'test') {
      // fuhgeddaboudit!
      resolve()
      return
    }

    if (!order_api_key) {
      reject()
      return
    }

    const client = getSupabaseServiceRoleClient()
    const { order, error } = await getOrderForApiKey(order_api_key, client)

    if (error || !order) {
      reject()
      return
    }

    const html = orderEmailTemplate(order)

    mailgun.messages().send(
      {
        from: 'MARSH COOP <noreply@marshcoop.org>',
        to:
          process.env.NODE_ENV === 'development'
            ? 'edward@edwardsharp.net'
            : order.email,
        bcc:
          process.env.NODE_ENV === 'development'
            ? 'MARSH ORDERS <edward@edwardsharp.net>'
            : 'MARSH ORDERS <bioculturalist@gmail.com>',
        subject: 'Your receipt from MARSH COOP',
        // text: 'order receipt'
        html,
      },
      (error: any, body: any) => {
        error && console.warn('mailgun.messages().send error!', error, body)
        error ? reject(error) : resolve()
      }
    )
  })
}
