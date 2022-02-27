#!/usr/bin/env ts-node

import {
  getProductsInStock,
  mapSqCatalogToProducts,
} from '../../services/square'

import dotenv from 'dotenv'
import { getSupabaseServiceRoleClient } from '../../services/supabase/supabase'
import path from 'path'
import { upsertProducts } from '../../services/supabase/products'

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
}


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
  }

  if (!catalog.length) {
    console.warn('no stock found!')
  }

  console.log('done!')
}

main()
