#!/usr/bin/env ts-node

import dotenv from 'dotenv'
import path from 'path'

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
}

import {
  getProductsInStock,
  mapSqCatalogToProducts,
} from '../../services/square'
import { getSupabaseServiceRoleClient } from '../../services/supabase/supabase'
import { upsertStock } from '../../services/supabase/stock'
import { upsertProducts } from '../../services/supabase/products'

const main = async () => {
  console.log('gonna fetch stock from square, this might take a while...')
  const catalog = await getProductsInStock()
  const products = await mapSqCatalogToProducts(catalog)

  console.log('square getProductsInStock() length:', catalog.length)

  if (products.length) {
    console.log(
      `gonna try to upsert ${products.length} stock items to supabase...`
    )
    const client = getSupabaseServiceRoleClient()
    await upsertProducts({ client, products })
    // await upsertStock({ client, products })
  }

  if (!catalog.length) {
    console.warn('no stock found!')
  }

  console.log('done!')
}

main()
