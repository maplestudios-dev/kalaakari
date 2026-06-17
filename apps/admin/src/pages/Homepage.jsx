import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { homepage } from '../lib/api.js'
import ImageUploader from '../components/ImageUploader.jsx'

const I = 'w-full bg-transparent border border-line py-2.5 px-3 text-ink outline-none focus:border-saffron'
function F({ label, children, className = '' }) {
  return <label className={`block ${className}`}><span className="label-tag block mb-1.5">{label}</span>{children}</label>
}

export default function HomepagePage() {
  const [loaded, setLoaded] = useState(false)
  const [saved, setSaved] = useState(false)
  const { register, handleSubmit, control, watch, setValue, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { heroSlides: [], brandLogos: [] }
  })

  const slides = useFieldArray({ control, name: 'heroSlides' })
  const logos  = useFieldArray({ control, name: 'brandLogos' })

  useEffect(() => {
    homepage.get().then((doc) => {
      reset({ heroSlides: doc.heroSlides || [], brandLogos: doc.brandLogos || [] })
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [reset])

  const submit = async (data) => {
    setSaved(false)
    await homepage.save(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!loaded) return <div className="label-tag text-ink-mute">Loading…</div>

  return (
    <form onSubmit={handleSubmit(submit)}>
      <header className="flex items-end justify-between mb-10">
        <div>
          <div className="label-tag">CMS · Homepage</div>
          <h1 className="font-display text-5xl mt-2">Homepage</h1>
          <p className="text-ink-mute text-sm mt-2 max-w-2xl">Manage the hero carousel and the client logo marquee. The first hero slide is the built-in KALAA × KAARI title screen; slides added here appear after it.</p>
        </div>
        <button disabled={isSubmitting} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">
          {isSubmitting ? 'Saving…' : saved ? 'Saved ✓' : 'Save →'}
        </button>
      </header>

      {/* ── Hero carousel slides ─────────────────────────── */}
      <section className="border border-line bg-bg-2 p-7 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl">Hero carousel slides</h2>
          <button type="button" onClick={() => slides.append({ kind: 'image', src: '', poster: '', alt: '', headline: '', sub: '', ctaLabel: '', ctaHref: '' })}
                  className="px-4 py-2 border border-line text-[11px] tracking-[.2em] uppercase hover:bg-ink hover:text-bg">+ Add slide</button>
        </div>

        {slides.fields.length === 0 && (
          <p className="label-tag text-ink-mute normal-case tracking-[.1em]">No extra slides — the homepage shows only the built-in title hero.</p>
        )}

        <div className="space-y-6">
          {slides.fields.map((f, i) => {
            const kind = watch(`heroSlides.${i}.kind`)
            return (
              <div key={f.id} className="border border-line p-5 bg-bg/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="label-tag">Slide {i + 2}</span>
                  <div className="flex gap-2">
                    <button type="button" disabled={i === 0} onClick={() => slides.move(i, i - 1)} className="px-2 py-1 border border-line text-xs disabled:opacity-30">↑</button>
                    <button type="button" disabled={i === slides.fields.length - 1} onClick={() => slides.move(i, i + 1)} className="px-2 py-1 border border-line text-xs disabled:opacity-30">↓</button>
                    <button type="button" onClick={() => slides.remove(i)} className="px-2 py-1 border border-line text-xs text-ink-mute hover:text-saffron">Remove</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <F label="Type">
                    <select {...register(`heroSlides.${i}.kind`)} className={I}>
                      <option value="image">Image (JPEG/PNG)</option>
                      <option value="video">Video (MP4/WebM)</option>
                    </select>
                  </F>
                  <F label="Link (optional)"><input {...register(`heroSlides.${i}.ctaHref`)} className={I} placeholder="/work/some-project" /></F>

                  <ImageUploader
                    className="md:col-span-2"
                    label={kind === 'video' ? 'Video file' : 'Image'}
                    help={kind === 'video' ? 'MP4 or WebM, up to 15 MB.' : 'JPEG or PNG — 1920×1080 or larger recommended.'}
                    field={`heroSlides.${i}.src`}
                    accept={kind === 'video' ? 'video/*' : 'image/*'}
                    aspectClass="w-48 h-27"
                    previewStyle={{ aspectRatio: '16 / 9' }}
                    register={register} setValue={setValue} watch={watch}
                  />

                  {kind === 'video' && (
                    <ImageUploader
                      className="md:col-span-2"
                      label="Poster (shown before the video plays)"
                      field={`heroSlides.${i}.poster`}
                      accept="image/*"
                      aspectClass="w-48 h-27"
                      previewStyle={{ aspectRatio: '16 / 9' }}
                      register={register} setValue={setValue} watch={watch}
                    />
                  )}

                  <F label="Alt text"><input {...register(`heroSlides.${i}.alt`)} className={I} placeholder="Describe the slide" /></F>
                  <F label="CTA label (optional)"><input {...register(`heroSlides.${i}.ctaLabel`)} className={I} placeholder="View the project →" /></F>
                  <F label="Headline (optional)" className="md:col-span-2"><input {...register(`heroSlides.${i}.headline`)} className={I} placeholder="Featured: Namkeen Republic" /></F>
                  <F label="Sub-text (optional)" className="md:col-span-2"><input {...register(`heroSlides.${i}.sub`)} className={I} /></F>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Client logo marquee ──────────────────────────── */}
      <section className="border border-line bg-bg-2 p-7 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl">Client logo marquee</h2>
          <button type="button" onClick={() => logos.append({ name: '', logo: '' })}
                  className="px-4 py-2 border border-line text-[11px] tracking-[.2em] uppercase hover:bg-ink hover:text-bg">+ Add logo</button>
        </div>

        {logos.fields.length === 0 && (
          <p className="label-tag text-ink-mute normal-case tracking-[.1em]">No logos yet — the marquee falls back to the text names from Site Copy until you add logos here.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {logos.fields.map((f, i) => (
            <div key={f.id} className="border border-line p-4 bg-bg/30">
              <div className="flex items-center justify-between mb-3">
                <span className="label-tag">Logo {i + 1}</span>
                <div className="flex gap-2">
                  <button type="button" disabled={i === 0} onClick={() => logos.move(i, i - 1)} className="px-2 py-1 border border-line text-xs disabled:opacity-30">↑</button>
                  <button type="button" disabled={i === logos.fields.length - 1} onClick={() => logos.move(i, i + 1)} className="px-2 py-1 border border-line text-xs disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => logos.remove(i)} className="px-2 py-1 border border-line text-xs text-ink-mute hover:text-saffron">Remove</button>
                </div>
              </div>
              <F label="Brand name" className="mb-3"><input {...register(`brandLogos.${i}.name`)} className={I} placeholder="Swiggy" /></F>
              <ImageUploader
                label="Logo (transparent PNG/SVG preferred)"
                help="Use a transparent-background logo. It is auto-tinted light so it reads on the dark marquee."
                field={`brandLogos.${i}.logo`}
                accept="image/*"
                aspectClass="w-28 h-16"
                register={register} setValue={setValue} watch={watch}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button disabled={isSubmitting} className="px-6 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">
          {isSubmitting ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes →'}
        </button>
      </div>
    </form>
  )
}
