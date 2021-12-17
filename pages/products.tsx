import type { NextPage } from 'next'
import Head from 'next/head'
import ProductsList from '../components/products/ProductsList'

const ProductsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>MARSH COOP</title>
        <meta name="description" content="MARSH COOP" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ProductsList />
    </>
  )
}

export default ProductsPage
