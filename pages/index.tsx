import Head from 'next/head'
import Link from 'next/link'
import type { NextPage } from 'next'
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
          <Link href="/store">
            <a className={styles.card}>
              <h2>Store</h2>
              <p>Browse product catalog, checkout with items in your cart.</p>
            </a>
          </Link>
          <Link href="/admin">
            <a className={styles.card}>
              <h2>Admin</h2>
              <p>Administration pages.</p>
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
