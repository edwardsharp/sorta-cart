import type { NextPage } from 'next'
import Head from 'next/head'
import ProductsCard from '../components/products/ProductsCard'
import StockCard from '../components/stock/StockCard'

import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>SORTA-CART</title>
        <meta name="description" content="SORTA-CART" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>SORTA-CART</h1>

        <div className={styles.grid}>
          <a href="/products" className={styles.card}>
            <ProductsCard />
          </a>
          <a href="/stock" className={styles.card}>
            <StockCard />
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/edwardsharp"
          target="_blank"
          rel="noopener noreferrer"
        >
          made with ♥ in NYC
        </a>
      </footer>
    </div>
  )
}

export default Home
