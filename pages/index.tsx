import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
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
          <Link href="/products">
            <a className={styles.card}>
              <ProductsCard />
            </a>
          </Link>
          <Link href="/stock">
            <a className={styles.card}>
              <StockCard />
            </a>
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <Link href="https://github.com/edwardsharp">
          <a target="_blank" rel="noopener noreferrer">
            made with ♥ in NYC
          </a>
        </Link>
      </footer>
    </div>
  )
}

export default Home
