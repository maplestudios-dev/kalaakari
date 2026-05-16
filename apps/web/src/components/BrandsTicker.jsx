import { useCopy } from '../lib/copy.jsx'

const isDeva = (s = '') => /[ऀ-ॿ]/.test(s)

export default function BrandsTicker() {
  const tokens = useCopy('brandsTicker') || []
  const row = [...tokens, ...tokens]
  return (
    <section className="border-y border-line bg-bg overflow-hidden py-12">
      <div className="flex gap-20 whitespace-nowrap animate-[kalaa-bk_50s_linear_infinite] items-center">
        <style>{`@keyframes kalaa-bk { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
        {row.map((t, i) =>
          isDeva(t)
            ? <span key={i} className="font-deva text-mustard text-3xl">{t}</span>
            : <span key={i} className="font-display text-4xl text-ink-mute uppercase">{t}</span>
        )}
      </div>
    </section>
  )
}
