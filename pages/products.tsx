import type { NextPage } from 'next'
import Head from 'next/head'
import ProductsGrid from '../components/products/ProductsGrid'

const ProductsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>SORTA-CART | PRODUCTS</title>
        <meta name="description" content="SORTA-CART" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ProductsGrid />
    </>
  )
}

export default ProductsPage
