import React, { useEffect, useRef, useState } from 'react'
import { string } from 'square/dist/schema'
import useSWR from 'swr'

import {
  getCategories,
  getSubCategories,
  Product,
} from '../../services/supabase/products'
import { supabase } from '../../services/supabase/supabase'
import styles from '../../styles/Grid.module.css'

const COLORS = [
  ['lightblue', 'peachpuff'],
  ['lightcoral', 'powderblue'],
  ['lightcyan', 'palevioletred'],
  ['lightgoldenrodyellow', 'paleturquoise'],
  ['lightgray', 'seagreen'],
  ['lightgreen', 'wheat'],
  ['lightgrey', 'palegreen'],
  ['lightpink', 'palegoldenrod'],
  ['lightsalmon', 'lemonchiffon'],
  ['lightseagreen', 'papayawhip'],
  ['lightskyblue', 'coral'],
  ['oldlace', 'skyblue'],
  ['lightsteelblue', 'aquamarine'],
  ['lightyellow', 'yellowgreen'],
]

function randomStyle() {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]
  return {
    sticky: {
      backgroundColor: 'white',
      borderColor: color[1],
      boxShadow: `0px 9px 0px 3px ${color[1]}`,
      '--box-shadow-color': color[1],
    },
    card: {
      borderColor: color[1],
      '--box-shadow-color': color[1],
    },
  }
}

function formatPrice(product: Product) {
  if (!product.u_price || !product.ws_price) {
    return ''
  }
  const u_price = parseFloat(`${product.u_price}`).toFixed(2)
  if (product.ws_price === product.u_price) {
    return (
      <>
        <h2>${u_price}</h2>
        <div>
          <i>
            {product.pk && product.pk > 1 ? `${product.pk} pk` : ''}{' '}
            {product.size}
          </i>
        </div>
      </>
    )
  }
  const ws_price = parseFloat(`${product.ws_price}`).toFixed(2)
  return (
    <>
      <h2>${u_price}</h2>{' '}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <i>
          {product.pk && product.pk > 1 ? `${product.pk} pk` : ''}{' '}
          {product.size}
        </i>
        <i>${ws_price} case</i>
      </div>
    </>
  )
}

function useClickAwayListener(
  ref: React.RefObject<HTMLElement>,
  cb: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        cb()
      }
    }
    // add the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // tear down the event listener
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref])
}

// shout-out to https://usehooks.com/useLocalStorage/
function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.log(error)
      return initialValue
    }
  })
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      // Save state
      setStoredValue(valueToStore)
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error)
    }
  }
  return [storedValue, setValue] as const
}

const ProductCard = (props: {
  product: Product
  style: React.CSSProperties
}) => {
  const { product, style: cardStyle } = props
  const [selected, setSelected] = useState(false)
  const [selectedStyles, setSelectedStyles] = useState<
    { height: number; width: number } | object
  >({})
  const [count, setCount] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const clickAwayRef = useRef<HTMLDivElement>(null)
  useClickAwayListener(clickAwayRef, () => setSelected(false))

  const handleContainerClick = (event: any) => {
    if (cardRef.current) {
      const clientRect = cardRef.current.getBoundingClientRect()
      setSelectedStyles({
        height: clientRect.height - 3,
        width: clientRect.width - 3,
      })
    }
    if (!selected) {
      setSelected(true)
    }
  }

  const incrementCount = (direction: '-' | '+') => {
    if (direction === '-') {
      setCount((prev) => (prev - 1 < 0 ? 0 : prev - 1))
      return
    }
    setCount((prev) => prev + 1)
  }

  return (
    <div
      className={styles.card}
      style={cardStyle}
      onClick={handleContainerClick}
      ref={cardRef}
    >
      {selected && (
        <div
          className={styles.cardSelected}
          style={selectedStyles}
          ref={clickAwayRef}
        >
          <div onClick={() => incrementCount('-')}>-</div>

          <input
            type="number"
            value={count}
            onChange={(ev) => setCount(ev.target.valueAsNumber)}
            min={0}
          />

          <div onClick={() => incrementCount('+')}>+</div>
        </div>
      )}
      <p>{product.description}</p>
      <div>{formatPrice(product)}</div>
      <div>
        <small>{product.name}</small>
        <b style={{ marginLeft: 6 }}>{count > 0 && `${count} in cart`}</b>
      </div>
    </div>
  )
}

interface ProductsGrouped {
  [index: string]: { [index: string]: Product[] }
}

interface ProductsData {
  grouped: ProductsGrouped
  cats: string[]
  count: number
}

const Grid = (props: { products: ProductsData; error: any }) => {
  const { products, error } = props
  if (error) return <div>failed to load</div>
  if (!products) return <div>loading . . .</div>

  return (
    <>
      {products.cats.map((cat) => (
        <div key={cat}>
          {products.grouped &&
            products.grouped[cat] &&
            Object.keys(products.grouped[cat]).map((sub_cat) => {
              const { sticky, card } = randomStyle()
              return (
                <div key={sub_cat} className={styles.grid}>
                  <div className={styles.cat} style={sticky}>
                    <h1>{cat}</h1>
                    <h2>
                      {sub_cat}
                      {products.grouped &&
                      products.grouped[cat][sub_cat].length > 3
                        ? ` (${products.grouped[cat][sub_cat].length})`
                        : ''}
                    </h2>
                  </div>
                  {products.grouped &&
                    products.grouped[cat][sub_cat].map((product) => (
                      <ProductCard
                        product={product}
                        style={card}
                        key={product.id}
                      />
                    ))}
                </div>
              )
            })}
        </div>
      ))}
    </>
  )
}

interface ShoppingListItem {
  item: string
  done: boolean
}
const ShoppingList = (props: {
  searchQ: string
  setSearchQ: React.Dispatch<React.SetStateAction<string>>
}) => {
  const { searchQ, setSearchQ } = props
  // const [shoppingList, setShoppingList] = useState<
  //   Array<{ item: string; done: boolean }>
  // >([])

  const [shoppingList, setShoppingList] = useLocalStorage<ShoppingListItem[]>(
    'shoppingList',
    []
  )

  const onItemChange = (idx: number, item: string) => {
    setShoppingList((prev) =>
      prev.map((o, i) => (i === idx ? { item, done: o.done } : o))
    )
  }
  const onDoneChange = (idx: number, done: boolean) => {
    setShoppingList((prev) =>
      prev.map((o, i) => (i === idx ? { item: o.item, done } : o))
    )
  }

  const deleteItem = (idx: number) => {
    setShoppingList((prev) => prev.filter((o, i) => i !== idx))
  }

  return (
    <div className={styles.shopping_list}>
      <div className={styles.shopping_list_title}>
        <span>Shopping list</span>
        <button
          onClick={() => {
            setShoppingList((prev) => [{ item: '', done: false }, ...prev])
          }}
          className={styles.add_to_list}
          title="add a new item to the shopping list"
        >
          +
        </button>
      </div>
      {shoppingList.reverse().map((o, idx) => (
        <div className={styles.shopping_list_items} key={`shoplist${idx}`}>
          <input
            type="checkbox"
            checked={o.done}
            onChange={(ev) => onDoneChange(idx, ev.target.checked)}
            title={`mark as ${o.done ? 'not ' : ''}done`}
          />
          {o.done ? (
            <>
              <span className={styles.done}>{o.item}</span>
              <button
                className={styles.item}
                onClick={() => deleteItem(idx)}
                title="remove from list"
              >
                x
              </button>
            </>
          ) : (
            <>
              <input
                className={styles.item}
                type="text"
                placeholder="New Item"
                value={o.item}
                onChange={(ev) => onItemChange(idx, ev.target.value)}
              />
              <button
                className={styles.item}
                onClick={() => setSearchQ(o.item)}
                title={o.item ? `search for ${o.item}` : ''}
                disabled={!o.item}
              >
                search
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

export default function ProductGrid() {
  const [searchQ, setSearchQ] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCatz, setSelectedCatz] = useState<string[]>([])
  const [selectedSubCatz, setSelectedSubCatz] = useState<string[]>([])

  const clickAwayRef = useRef<HTMLDivElement>(null)
  useClickAwayListener(clickAwayRef, () => setShowFilters(false))

  const { data: products, error } = useSWR(
    { key: 'get_product', searchQ, selectedCatz, selectedSubCatz },
    async ({ searchQ: q, selectedCatz: catz, selectedSubCatz: subcatz }) => {
      let query = supabase.rpc('default_products', undefined, {
        count: 'exact',
      })

      if (q) {
        // query = query.textSearch('fts', q, {
        //   type: 'websearch',
        //   config: 'english',
        // })
        query = query.or(
          ['name', 'description'].map((f) => `${f}.ilike."%${q}%"`).join(',')
        )
      }
      if (catz && catz.length) {
        query = query.in('category', catz)
      }
      if (subcatz && subcatz.length) {
        query = query.in('sub_category', subcatz)
      }
      const { data: products, error, count } = await query

      let cats: string[] = []
      const grouped = products?.reduce((acc, product) => {
        const cat = product.category || 'no category'
        if (!acc[cat]) {
          acc[cat] = {}
        }
        if (!cats.includes(cat)) {
          cats.push(cat)
        }
        const sub_cat = product.sub_category || ''
        if (!acc[cat][sub_cat]) {
          acc[cat][sub_cat] = []
        }
        acc[cat][sub_cat].push(product)

        return acc
      }, {} as ProductsGrouped)

      return { grouped, cats, count: count || 0 }
    }
  )

  const { data: categories, error: catError } = useSWR(
    'categories',
    async () => {
      const catz = await getCategories()
      return Object.keys(catz)
    }
  )

  const { data: sub_categories, error: subCatError } = useSWR(
    { key: 'categories', selectedCatz },
    async () => {
      let allSubCatz: string[] = []
      for await (const c of selectedCatz) {
        const subcatz = await getSubCategories(c)
        allSubCatz = [...allSubCatz, ...Object.keys(subcatz)]
      }

      return allSubCatz
    }
  )

  const catzCount = selectedCatz.length + selectedSubCatz.length

  const getSearchLabel = () => {
    if (!products) {
      return 'l o a d i n g . . .'
    }

    const count = `${products.count} product${products.count > 1 ? 's' : ''}`

    if (catzCount === 1) {
      return `${count} in ${catzCount} category.`
    }
    if (catzCount > 1) {
      return `${count} in ${catzCount} categories.`
    }

    return count
  }

  return (
    <>
      <div className={styles.search_container}>
        <div>
          <label htmlFor="search">
            <input
              id="search"
              className={styles.search}
              type="search"
              placeholder="Search"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />

            {getSearchLabel()}
          </label>

          {!showFilters && (
            <button
              className={styles.filters_btn}
              title={`${showFilters ? 'hide' : 'show'} filters`}
              onClick={() => setShowFilters((prev) => !prev)}
            >
              {showFilters ? '✕' : '☷'}
            </button>
          )}
        </div>
        {showFilters && (
          <div className={styles.filters} ref={clickAwayRef}>
            <label className={styles.cat_label}>
              Category ({categories?.length || 0})
            </label>
            <select
              name="cat-select"
              multiple
              value={selectedCatz}
              onChange={(e) => {
                setSelectedCatz(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
                setSelectedSubCatz([])
              }}
            >
              {categories?.map((cat) => (
                <option key={`c${cat}`} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {sub_categories && sub_categories.length > 0 && (
              <>
                <label className={styles.cat_label}>
                  Sub Category ({sub_categories?.length || 0})
                </label>
                <select
                  name="sub-cat-select"
                  multiple
                  value={selectedSubCatz}
                  onChange={(e) =>
                    setSelectedSubCatz(
                      Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      )
                    )
                  }
                >
                  {sub_categories?.map((subcat) => (
                    <option key={`s${subcat}`} value={subcat}>
                      {subcat}
                    </option>
                  ))}
                </select>
              </>
            )}
            {catzCount > 0 && (
              <div className={styles.filter_reset}>
                <button
                  onClick={() => {
                    setSelectedCatz([])
                    setSelectedSubCatz([])
                  }}
                  title="clear all selected categories"
                >
                  reset categories
                </button>
              </div>
            )}

            <ShoppingList searchQ={searchQ} setSearchQ={setSearchQ} />
          </div>
        )}
      </div>

      {products && <Grid products={products} error={error} />}
    </>
  )
}
