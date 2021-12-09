import { useCallback, useEffect, useState } from 'react'
import { getProducts, Product } from '../../services/products'

export default function ProductsCard() {
  const [products, setProducts] = useState<Product[]>([])

  const fetchProducts = useCallback(async () => {
    const { data, error } = await getProducts()
    if (!error && data && data.length) {
      setProducts(data)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [])
  return (
    <>
      <h2>Products</h2>
      <p>{products && products.length}</p>
    </>
  )
}
