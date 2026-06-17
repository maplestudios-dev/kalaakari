import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { SplitText, FadeContent } from '../components/bits/index.jsx'
import SEOHead from '../components/SEOHead.jsx'

const TABS = [
  { value: 'all',   label: 'All' },
  { value: 'music', label: 'Music' },
  { value: 'movie', label: 'Movies' },
  { value: 'book',  label: 'Books' }
]

const DEMO = [
  { _id: 'm1', type: 'music', title: 'Aaja Nachle (Reprise)', creator: 'Madan Mohan revisited', note: 'On loop in the edit bay.', cover: '' },
  { _id: 'v1', type: 'movie', title: 'Court', creator: 'Chaitanya Tamhane', note: 'A masterclass in restraint.', cover: '' },
  { _id: 'b1', type: 'book',  title: 'The Anatomy of Story', creator: 'John Truby', note: 'We hand this to every new writer.', cover: '' }
]

export default function Recommendations() {
  const [items, setItems] = useState(DEMO)
  const [usingApi, setUsingApi] = useState(false)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL
    if (!api) return
    axios.get(`${api}/recommendations`).then((r) => {
      if (r.data?.items?.length) { setItems(r.data.items); setUsingApi(true) }
    }).catch(() => {})
  }, [])

  const filtered = useMemo(() => (tab === 'all' ? items : items.filter((i) => i.type === tab)), [items, tab])

  return (
    <>
      <SEOHead overrides={{ title: 'Recommendations · KALAAKAARI', description: 'Music, movies, and books the KALAAKAARI studio is into right now.' }} />

      <section className="pt-32 sm:pt-44 pb-12">
        <div className="max-w-[1320px] mx-auto px-7">
          <span className="label-tag">What we're into · <span className="font-deva text-mustard normal-case">सिफ़ारिशें</span></span>
          <h1 className="font-display mt-6 break-words" style={{ fontSize: 'clamp(44px,12vw,220px)', letterSpacing: '-.02em' }}>
            <SplitText text="Recommendations" by="word" />
          </h1>
          <p className="font-serif-i text-parchment mt-8 max-w-3xl text-xl leading-relaxed">
            Music, movies, and books the studio is loving right now. {usingApi ? '' : <span className="text-ink-mute text-base">(Demo content — manage from admin · /recommendations.)</span>}
          </p>

          <div className="mt-12 flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button key={t.value} onClick={() => setTab(t.value)}
                className={`px-4 py-2 border text-[11px] tracking-[.2em] uppercase transition-colors ${tab === t.value ? 'bg-saffron text-bg border-saffron' : 'border-line text-ink-mute hover:text-ink'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-32">
        <div className="max-w-[1320px] mx-auto px-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((x, i) => {
            const card = (
              <div className="group block h-full border border-line bg-bg-2 overflow-hidden hover:border-saffron transition-colors">
                <div className="aspect-[3/4] relative overflow-hidden"
                     style={x.cover ? { background: `url(${x.cover}) center/cover no-repeat` } : { background: 'linear-gradient(135deg,#2a1810,#0f0a07)' }}>
                  {!x.cover && <span className="absolute inset-0 grid place-items-center font-display text-ink-mute/15 text-center px-4 text-3xl">{x.title}</span>}
                  <span className="absolute top-4 left-4 label-tag text-mustard bg-bg/80 px-2.5 py-1.5 border border-line capitalize">{x.type}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-2xl">{x.title}</h3>
                  {x.creator && <span className="label-tag mt-1.5 block">{x.creator}</span>}
                  {x.note && <p className="font-serif-i text-ink-mute mt-3 leading-relaxed">{x.note}</p>}
                  {x.link && <span className="inline-block mt-4 label-tag text-saffron group-hover:underline">Open →</span>}
                </div>
              </div>
            )
            return (
              <FadeContent key={x._id} delay={(i % 3) * 0.06}>
                {x.link
                  ? <a href={x.link} target="_blank" rel="noopener noreferrer" className="block h-full">{card}</a>
                  : card}
              </FadeContent>
            )
          })}
          {filtered.length === 0 && (
            <p className="label-tag text-ink-mute col-span-full py-16 text-center">Nothing here yet.</p>
          )}
        </div>
      </section>
    </>
  )
}
