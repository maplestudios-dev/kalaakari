import { useEffect, useState } from 'react'
import axios from 'axios'
import { SplitText, FadeContent, TiltedCard } from '../components/bits/index.jsx'
import SEOHead from '../components/SEOHead.jsx'
import { useCopy } from '../lib/copy.jsx'
import { youtubeEmbedSrc, vimeoEmbedSrc, posterFor } from '../lib/videoEmbed.js'

const CATEGORY_FILTERS = ['Ad Film', 'Brand Film', 'Music Video', 'Reel', 'BTS', 'Short Film', 'Documentary']

const DEMO = [
  { _id: '1', title: 'Namkeen Republic — Launch Film', client: 'Namkeen Republic', category: 'Ad Film', year: 2025, duration: 47, youtubeId: '', excerpt: 'A 47-second hook for a snack disruptor.', featured: true },
  { _id: '2', title: 'Aroha — The Heirloom', client: 'Aroha Jewels', category: 'Brand Film', year: 2024, duration: 90, youtubeId: '', excerpt: 'A film about what we pass down.' },
  { _id: '3', title: 'Hauz Khas Collective — Identity Reel', client: 'HKC', category: 'Reel', year: 2025, duration: 22, youtubeId: '', excerpt: 'Identity in motion.' }
]

export default function Reel() {
  const cp = useCopy('pages.reel') || {}
  const allLabel = 'All'
  const [filter, setFilter] = useState(allLabel)
  const [items, setItems] = useState(DEMO)
  const [playing, setPlaying] = useState(null)
  const [usingApi, setUsingApi] = useState(false)
  const [filterCats, setFilterCats] = useState(CATEGORY_FILTERS)
  const CATS = [allLabel, ...filterCats]

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL
    if (!api) return
    axios.get(`${api}/video`).then((r) => {
      if (r.data?.items?.length) { setItems(r.data.items); setUsingApi(true) }
    }).catch(() => {})
    axios.get(`${api}/categories?type=video`).then((r) => {
      const names = (r.data?.items || []).map((c) => c.name)
      if (names.length) setFilterCats(names)
    }).catch(() => {})
  }, [])

  const filtered = filter === allLabel ? items : items.filter((v) => v.category === filter)
  // /reel hero is pinned independently of the homepage "featured" flag.
  const featured = items.find((v) => v.reelHero) || items.find((v) => v.featured) || items[0]

  return (
    <>
      <SEOHead overrides={{ title: 'The Reel · KALAAKAARI', description: 'Films, ads and brand moving image work from the KALAAKAARI studio.' }} />

      <section className="pt-32 sm:pt-44 pb-12">
        <div className="max-w-[1320px] mx-auto px-7">
          <span className="label-tag">{cp.eyebrow} · <span className="font-deva text-mustard normal-case">{cp.eyebrowDeva}</span></span>
          <h1 className="font-display mt-6 break-words" style={{ fontSize: 'clamp(48px,12vw,220px)', letterSpacing: '-.02em' }}>
            <SplitText text={cp.title || ''} by="word" />
          </h1>
          <p className="font-serif-i text-parchment mt-8 max-w-3xl text-xl leading-relaxed">
            {cp.sub} {usingApi ? '' : <span className="text-ink-mute text-base">(Demo content — connect API to load live items.)</span>}
          </p>
        </div>
      </section>

      {/* Featured film */}
      {featured && (
        <section className="pb-16">
          <div className="max-w-[1320px] mx-auto px-7">
            <FadeContent>
              <div className="relative aspect-video bg-bg-2 border border-line cursor-pointer group overflow-hidden"
                   onClick={() => setPlaying(featured)}>
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2a1810] to-[#0a0805]"
                     style={posterFor(featured) ? { background: `url(${posterFor(featured)}) center/cover no-repeat` } : undefined}>
                  {!posterFor(featured) && (
                    <span className="font-display text-[clamp(48px,8vw,140px)] text-ink-mute/10 px-6 text-center">{featured.title}</span>
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-saffron grid place-items-center group-hover:scale-110 transition-transform">
                    <span className="text-bg text-2xl ml-1">▶</span>
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-bg/90 to-transparent">
                  <span className="label-tag text-mustard">{featured.category} · {featured.year} · {featured.duration}s</span>
                  <h2 className="font-display text-3xl md:text-5xl mt-2">{featured.title}</h2>
                  <p className="font-serif-i text-ink-mute mt-2 max-w-xl">{featured.excerpt}</p>
                </div>
              </div>
            </FadeContent>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="pb-8">
        <div className="max-w-[1320px] mx-auto px-7 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-4 py-2 border text-[11px] tracking-[.2em] uppercase transition-colors ${filter === c ? 'bg-saffron text-bg border-saffron' : 'border-line text-ink-mute hover:text-ink'}`}>
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="pb-32">
        <div className="max-w-[1320px] mx-auto px-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((v, i) => (
            <FadeContent key={v._id} delay={(i % 3) * 0.06}>
              <button onClick={() => setPlaying(v)} className="block w-full text-left">
                <TiltedCard max={4}>
                  <div className={`relative ${v.orientation === 'portrait' ? 'aspect-[9/16] max-w-[300px] mx-auto' : 'aspect-video'} bg-bg-2 border border-line overflow-hidden hover:border-saffron transition-colors group`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2a1810] to-[#0a0805] flex items-center justify-center"
                         style={posterFor(v) ? { background: `url(${posterFor(v)}) center/cover no-repeat` } : undefined}>
                      {!posterFor(v) && (
                        <span className="font-display text-2xl md:text-3xl text-ink-mute/15 px-4 text-center">{v.title}</span>
                      )}
                    </div>
                    <span className="absolute top-4 left-4 label-tag text-mustard bg-bg/80 px-2.5 py-1.5 border border-line">{v.category}</span>
                    <span className="absolute top-4 right-4 font-display text-sm text-ink-mute">{v.duration}s</span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-saffron grid place-items-center"><span className="text-bg ml-0.5">▶</span></div>
                    </div>
                  </div>
                </TiltedCard>
                <div className="px-1 py-4 flex justify-between items-end gap-3">
                  <div>
                    <h4 className="font-display text-xl">{v.title}</h4>
                    {v.year && <span className="label-tag mt-1 block">{v.year}</span>}
                  </div>
                  {v.client && v.client !== v.title && (
                    <span className="font-display text-xl text-ink-mute text-right leading-none shrink-0">{v.client}</span>
                  )}
                </div>
              </button>
            </FadeContent>
          ))}
        </div>
      </section>

      {/* Theater modal */}
      {playing && (
        <div className="fixed inset-0 z-[100] bg-black/95 grid place-items-center p-6" onClick={() => setPlaying(null)}>
          <div className={`w-full ${playing.orientation === 'portrait' ? 'max-w-[420px]' : 'max-w-6xl'}`} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPlaying(null)} className="text-ink-mute hover:text-saffron text-sm tracking-[.2em] uppercase mb-4">Close ×</button>
            <div className={`${playing.orientation === 'portrait' ? 'aspect-[9/16]' : 'aspect-video'} bg-black border border-line`}>
              {playing.youtubeId
                ? <iframe className="w-full h-full" src={youtubeEmbedSrc(playing.youtubeId)} title={playing.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                : playing.vimeoId
                  ? <iframe className="w-full h-full" src={vimeoEmbedSrc(playing.vimeoId)} title={playing.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
                  : playing.mp4Url
                    ? <video className="w-full h-full" src={playing.mp4Url} controls autoPlay />
                    : <div className="grid place-items-center h-full text-ink-mute">No playable source</div>}
            </div>
            <div className="mt-4">
              <h2 className="font-display text-3xl">{playing.title}</h2>
              <span className="label-tag">{playing.category} · {playing.year} · {playing.client}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
