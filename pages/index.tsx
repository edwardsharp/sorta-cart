import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Products from '../components/products/Products'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>MARSH COOP</title>
        <meta name="description" content="MARSH COOP" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>MARSHCOOP</h1>

        <div className={styles.grid}>
          <a href="/products" className={styles.card}>
            <Products />
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/marshlife-art"
          target="_blank"
          rel="noopener noreferrer"
        >
          made with {'<3'} in NYC
        </a>
      </footer>
    </div>
  )
}

export default Home
