export default function Section({ id, className = '', children }) {
  return (
    <section id={id} className={`relative ${className}`}>
      <div className="max-w-[1320px] mx-auto px-7">{children}</div>
    </section>
  )
}

export function SectionHead({ label, deva, title, right }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
      <div>
        <span className="label-tag flex items-center gap-3">
          <span className="block w-9 h-px bg-saffron" />
          {label} {deva && <span className="font-deva text-mustard ml-1 normal-case tracking-normal text-[14px]">{deva}</span>}
        </span>
        <h2 className="font-display text-[clamp(36px,5vw,72px)] leading-[.95] mt-4 max-w-3xl">{title}</h2>
      </div>
      {right}
    </div>
  )
}
