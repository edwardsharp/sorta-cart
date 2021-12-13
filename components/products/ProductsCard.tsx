import { useCallback, useEffect, useState, Suspense } from 'react'
import { getProductsSuspense, Product } from '../../services/products'

const resource = getProductsSuspense()

function ProductsCard() {
  const products = resource.read()

  return (
    <>
      <h2>Products</h2>
      <p>{products && products.length}</p>
    </>
  )
}

export default function ProductsCardSuspense() {
  return (
    <Suspense fallback={<h2>loading products...</h2>}>
      <ProductsCard />
    </Suspense>
  )
}
