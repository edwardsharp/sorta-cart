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
import fs from 'fs'
import superjson from 'superjson'

const main = async () => {
  console.log('gonna fetch stock from square, this might take a while...')
  const catalog = await getProductsInStock()
  const products = await mapSqCatalogToProducts(catalog)

  console.log('square getProductsInStock() length:', catalog.length)

  if (catalog.length) {
    console.log('square getProductsInStock() length:', catalog.length)
    fs.writeFileSync('catalog.json', superjson.stringify(catalog))

    fs.writeFileSync('products.json', superjson.stringify(products))
    console.log('wrote file: catalog.json, stock.json.')
  } else {
    console.warn('no stock!')
  }

  console.log('done!')
}

main()
