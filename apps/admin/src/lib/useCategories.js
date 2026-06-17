import { useEffect, useState } from 'react'
import { categories } from './api.js'

/**
 * Load CMS category names for a type, falling back to a hardcoded list until
 * the API responds (or if it has none). Used to populate category <select>s.
 */
export function useCategories(type, fallback = []) {
  const [names, setNames] = useState(fallback)
  useEffect(() => {
    let active = true
    categories.list(type)
      .then((list) => { if (active && list.length) setNames(list.map((c) => c.name)) })
      .catch(() => {})
    return () => { active = false }
  }, [type])
  return names
}
