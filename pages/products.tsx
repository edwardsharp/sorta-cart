import type { NextPage } from 'next'
import Head from 'next/head'
import Products from '../components/products/Products'

const ProductsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>MARSH COOP</title>
        <meta name="description" content="MARSH COOP" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Products />
    </>
  )
}

export default ProductsPage
