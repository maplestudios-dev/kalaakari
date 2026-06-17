import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Section, { SectionHead } from './Section.jsx'
import { FadeContent, TiltedCard, Magnet } from './bits/index.jsx'
import VideoTheater from './VideoTheater.jsx'
import { useCopy } from '../lib/copy.jsx'
import { posterFor } from '../lib/videoEmbed.js'

const DEMO = [
  { _id: 'rd1', slug: 'namkeen-republic-launch', title: 'Namkeen Republic — Launch Film', category: 'Ad Film', year: 2025, duration: 47, youtubeId: '' },
  { _id: 'rd2', slug: 'aroha-heirloom',          title: 'Aroha — The Heirloom',           category: 'Brand Film', year: 2024, duration: 90, youtubeId: '' },
  { _id: 'rd3', slug: 'hkc-identity-reel',       title: 'Hauz Khas Collective — Identity Reel', category: 'Reel', year: 2025, duration: 22, youtubeId: '' }
]

export default function HomepageReel() {
  const r = useCopy('reel') || {}
  const eyebrow    = r.eyebrow    || 'In motion'
  const eyebrowDev = r.eyebrowDeva || 'रील'
  const title      = r.title      || <>Films that punch<br />above their length.</>
  const ctaLabel   = (r.cta && r.cta.label) || 'See the full reel →'

  const [items, setItems] = useState(DEMO)
  const [playing, setPlaying] = useState(null)

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL
    if (!api) return
    axios.get(`${api}/video?featured=true`)
      .then((res) => {
        if (res.data?.items?.length) return res.data.items
        return axios.get(`${api}/video`).then((rr) => rr.data?.items || [])
      })
      .then((list) => { if (list.length) setItems(list.slice(0, 3)) })
      .catch(() => {})
  }, [])

  if (!items.length) return null

  return (
    <Section id="reel" className="py-32 border-t border-line">
      <SectionHead
        label={eyebrow}
        deva={eyebrowDev}
        title={title}
        right={
          <Magnet>
            <Link to="/reel" className="inline-flex items-center gap-3 px-7 py-4 border border-ink text-[12px] tracking-[.24em] uppercase hover:bg-ink hover:text-bg transition-colors">
              {ctaLabel}
            </Link>
          </Magnet>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((v, i) => (
          <FadeContent key={v._id || v.slug} delay={(i % 3) * 0.08}>
            <button onClick={() => setPlaying(v)} className="block w-full text-left">
              <TiltedCard max={4}>
                <div className="relative aspect-video bg-bg-2 border border-line overflow-hidden hover:border-saffron transition-colors group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2a1810] to-[#0a0805] flex items-center justify-center"
                       style={posterFor(v) ? { background: `url(${posterFor(v)}) center/cover no-repeat` } : undefined}>
                    {!posterFor(v) && (
                      <span className="font-display text-2xl md:text-3xl text-ink-mute/15 px-4 text-center">{v.title}</span>
                    )}
                  </div>
                  <span className="absolute top-4 left-4 label-tag text-mustard bg-bg/80 px-2.5 py-1.5 border border-line">{v.category}</span>
                  {v.duration && <span className="absolute top-4 right-4 font-display text-sm text-ink-mute bg-bg/80 px-2 py-1 border border-line">{v.duration}s</span>}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-saffron grid place-items-center group-hover:scale-110 transition-transform"><span className="text-bg ml-0.5 text-lg">▶</span></div>
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

      <VideoTheater video={playing} onClose={() => setPlaying(null)} />
    </Section>
  )
}
