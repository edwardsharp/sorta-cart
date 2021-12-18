import type { NextPage } from 'next'
import Head from 'next/head'
import StockList from '../components/stock/StockList'

const StockPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>MARSH COOP</title>
        <meta name="description" content="MARSH COOP" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <StockList />
    </>
  )
}

export default StockPage
