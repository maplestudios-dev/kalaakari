import { useEffect, useRef, useState } from 'react'
import { categories } from '../lib/api.js'
import { useRowDrag, reorder } from '../lib/useRowDrag.js'

const I = 'w-full bg-transparent border border-line py-2 px-3 text-ink outline-none focus:border-saffron'

export default function CategoriesPage() {
  return (
    <>
      <header className="mb-10">
        <div className="label-tag">CMS · Taxonomy</div>
        <h1 className="font-display text-5xl mt-2">Categories</h1>
        <p className="text-ink-mute text-sm mt-2 max-w-2xl">Add, rename, reorder, or remove the filter categories used across the site. Renaming a category updates every item already using it. Drag the <span className="text-mustard">⠿</span> handle to set the order filters appear.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategoryManager type="portfolio" label="Work / Portfolio" />
        <CategoryManager type="video"     label="Reel / Videos" />
        <CategoryManager type="journal"   label="Journal" />
      </div>
    </>
  )
}

function CategoryManager({ type, label }) {
  const [items, setItems] = useState([])
  const [adding, setAdding] = useState('')
  const saved = useRef({})

  const load = () => categories.list(type).then((list) => {
    setItems(list)
    saved.current = Object.fromEntries(list.map((c) => [c._id, c.name]))
  })
  useEffect(() => { load() }, [type])  // eslint-disable-line react-hooks/exhaustive-deps

  const { dragProps, overIndex } = useRowDrag((from, to) => {
    setItems((prev) => {
      const next = reorder(prev, from, to)
      categories.reorder(next.map((c) => c._id)).catch(load)
      return next
    })
  })

  const setName = (i, name) => setItems((prev) => prev.map((c, j) => (j === i ? { ...c, name } : c)))
  const commit = async (c) => {
    const name = (c.name || '').trim()
    if (!name || name === saved.current[c._id]) { if (!name) load(); return }
    await categories.rename(c._id, name).catch(load)
    saved.current[c._id] = name
  }
  const del = async (c) => { if (confirm(`Delete "${c.name}"? Items keep their label but lose this filter.`)) { await categories.remove(c._id); load() } }
  const add = async () => {
    const name = adding.trim()
    if (!name) return
    await categories.create(type, name).catch(() => {})
    setAdding('')
    load()
  }

  return (
    <section className="border border-line bg-bg-2 p-5">
      <h2 className="font-display text-xl mb-4">{label} <span className="label-tag text-[10px] text-ink-mute">· {items.length}</span></h2>

      <div className="space-y-2 mb-4">
        {items.map((c, i) => (
          <div key={c._id} {...dragProps(i)}
               className={`flex items-center gap-2 border border-line bg-bg/40 px-2 py-1.5 ${overIndex === i ? 'border-saffron' : ''}`}>
            <span className="text-ink-mute cursor-grab active:cursor-grabbing select-none px-1" title="Drag to reorder">⠿</span>
            <input
              value={c.name}
              onChange={(e) => setName(i, e.target.value)}
              onBlur={() => commit(c)}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
              className={I}
            />
            <button type="button" onClick={() => del(c)} className="text-ink-mute hover:text-saffron text-xs px-1" title="Delete">✕</button>
          </div>
        ))}
        {items.length === 0 && <p className="label-tag text-ink-mute normal-case tracking-[.1em]">None yet.</p>}
      </div>

      <div className="flex gap-2">
        <input
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="New category…"
          className={I}
        />
        <button type="button" onClick={add} className="px-4 border border-line text-[11px] tracking-[.2em] uppercase hover:bg-ink hover:text-bg whitespace-nowrap">Add</button>
      </div>
    </section>
  )
}
