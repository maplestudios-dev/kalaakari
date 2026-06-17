import { useRef, useState } from 'react'
import { media } from '../lib/api.js'

const I = 'w-full bg-transparent border border-line py-2.5 px-3 text-ink outline-none focus:border-saffron'
const isVideo = (url = '') => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)

/**
 * Reusable image upload widget — preview, upload button, optional URL paste.
 * Stores the resulting URL in react-hook-form under `field`. Optional aspect-ratio
 * preview box via `previewStyle={{ aspectRatio: '16 / 9' }}`.
 */
export default function ImageUploader({
  label, help, field, register, setValue, watch,
  className = '', previewStyle, aspectClass = 'w-32 h-32', accept = 'image/*'
}) {
  const value = watch(field)
  const fileRef = useRef(null)
  const [status, setStatus] = useState(null)

  const handle = async (file) => {
    if (!file) return
    setStatus({ progress: 0 })
    try {
      const { url } = await media.upload(file, (pct) => setStatus({ progress: pct }))
      setValue(field, url, { shouldDirty: true })
      setStatus(null)
    } catch (e) {
      setStatus({ error: e.response?.data?.error || e.message })
    }
  }

  return (
    <div className={`border border-line p-4 bg-bg/30 ${className}`}>
      <div className="label-tag mb-3">{label}</div>
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="shrink-0">
          {value
            ? (isVideo(value)
                ? <video src={value} muted loop playsInline className={`${aspectClass} object-cover border border-line`} style={previewStyle} />
                : <img src={value} alt={`${field} preview`} className={`${aspectClass} object-cover border border-line`} style={previewStyle} />)
            : <div className={`${aspectClass} grid place-items-center border border-line text-ink-mute label-tag text-[10px] bg-bg`} style={previewStyle}>No media</div>}
        </div>

        <div className="flex-1 space-y-3">
          {help && <p className="text-ink-mute text-[11px] leading-relaxed">{help}</p>}

          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handle(e.target.files?.[0])}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => fileRef.current?.click()}
                    className="px-3 py-2 border border-line text-[11px] tracking-[.18em] uppercase hover:bg-ink hover:text-bg">
              Upload image
            </button>
            {value && (
              <button type="button" onClick={() => setValue(field, '', { shouldDirty: true })}
                      className="px-3 py-2 border border-line text-[11px] tracking-[.18em] uppercase text-ink-mute hover:text-saffron">
                Clear
              </button>
            )}
          </div>

          {status?.progress != null && status.progress < 100 && (
            <div className="text-xs text-mustard">Uploading… {status.progress}%</div>
          )}
          {status?.error && (
            <div className="text-xs text-saffron">Upload failed: {status.error}</div>
          )}

          <label className="block">
            <span className="label-tag block mb-1 text-[10px]">…or paste a URL</span>
            <input {...register(field)} className={I} placeholder="https://… or /uploads/…" />
          </label>
        </div>
      </div>
    </div>
  )
}
