import { useCopy } from '../lib/copy.jsx'

export default function Marquee() {
  const items = useCopy('marquee') || []
  const seq = [...items, ...items]
  return (
    <section className="border-y border-line bg-bg-2 overflow-hidden py-6">
      <div className="flex gap-16 whitespace-nowrap animate-[kalaa-mq_38s_linear_infinite]">
        <style>{`@keyframes kalaa-mq { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
        {seq.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-16 font-display text-[34px] tracking-wide">
            <span className={it.acc ? 'text-saffron' : ''}>{it.en}</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-saffron" />
            <span className="font-deva text-mustard text-[28px]">{it.deva}</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-saffron" />
          </span>
        ))}
      </div>
    </section>
  )
}
