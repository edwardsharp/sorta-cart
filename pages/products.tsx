import type { NextPage } from 'next'
import Head from 'next/head'
import ProductsGrid from '../components/products/ProductsGrid'

const ProductsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>MARSH COOP</title>
        <meta name="description" content="MARSH COOP" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ProductsGrid />
    </>
  )
}

export default ProductsPage
