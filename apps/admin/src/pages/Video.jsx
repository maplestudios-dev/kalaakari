import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { video, portfolio, can } from '../lib/api.js'
import { extractYouTubeId, extractVimeoId, isYouTubeShorts } from '../lib/videoEmbed.js'
import ImageUploader from '../components/ImageUploader.jsx'

const CATS = ['Ad Film','Brand Film','Music Video','Reel','BTS','Short Film','Documentary','Other']

export default function VideoPage() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const refresh = () => video.list().then(setItems)
  useEffect(() => { refresh() }, [])

  return (
    <>
      <header className="flex items-end justify-between mb-10">
        <div>
          <div className="label-tag">CMS · Reel</div>
          <h1 className="font-display text-5xl mt-2">Videos</h1>
          <p className="text-ink-mute text-sm mt-2 max-w-2xl">Films, ads, brand videos and reels shown at <code className="text-mustard">/reel</code> on the public site.</p>
        </div>
        {can('video.write') && (
          <button onClick={() => setEditing({ _new: true })} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">+ Add video</button>
        )}
      </header>

      <div className="border border-line bg-bg-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left label-tag border-b border-line">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Client</th>
              <th className="p-4">Category</th>
              <th className="p-4">Year</th>
              <th className="p-4">Source</th>
              <th className="p-4">Featured</th>
              <th className="p-4">Live</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr key={v._id} className="border-b border-line">
                <td className="p-4">{v.title}<span className="block label-tag text-[10px] mt-1">{v.slug}</span></td>
                <td className="p-4 text-ink-mute">{v.client}</td>
                <td className="p-4">{v.category}</td>
                <td className="p-4">{v.year}</td>
                <td className="p-4 label-tag normal-case tracking-[.1em] text-[11px]">
                  {v.youtubeId ? `YouTube · ${v.youtubeId}` : v.vimeoId ? `Vimeo · ${v.vimeoId}` : v.mp4Url ? 'MP4' : '—'}
                </td>
                <td className="p-4">{v.featured ? <span className="text-mustard">★</span> : '—'}</td>
                <td className="p-4">{v.published ? <span className="label-tag">Live</span> : <span className="label-tag text-saffron">Draft</span>}</td>
                <td className="p-4 text-right space-x-3">
                  {can('video.write') && <button onClick={() => setEditing(v)} className="text-saffron hover:underline">edit</button>}
                  {can('video.delete') && <button onClick={async () => { if (confirm('Delete?')) { await video.remove(v._id); refresh() } }} className="text-ink-mute hover:text-saffron">delete</button>}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="8" className="p-10 text-center label-tag text-ink-mute">No videos yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && <Drawer initial={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null) }} />}
    </>
  )
}

function Drawer({ initial, onClose, onSaved }) {
  const isNew = initial._new
  const { register, handleSubmit, control, watch, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: isNew
      ? { category: 'Ad Film', published: true, source: 'youtube', orientation: 'landscape' }
      : { orientation: 'landscape', ...initial, source: initial.youtubeId ? 'youtube' : initial.vimeoId ? 'vimeo' : initial.mp4Url ? 'mp4' : 'youtube' }
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'credits' })
  const source = watch('source')
  const youtubeVal = watch('youtubeId')

  // A pasted YouTube Shorts URL is always vertical — flip orientation for the editor.
  useEffect(() => {
    if (source === 'youtube' && isYouTubeShorts(youtubeVal)) setValue('orientation', 'portrait')
  }, [youtubeVal, source, setValue])

  const submit = async (data) => {
    // strip the helper field + non-source IDs
    const { source: _src, tagsRaw, ...payload } = data
    if (source !== 'youtube') payload.youtubeId = ''
    if (source !== 'vimeo')   payload.vimeoId   = ''
    if (source !== 'mp4')     payload.mp4Url    = ''
    // Editors often paste a full share/watch URL — store the bare ID so the
    // public player builds a valid embed src.
    if (source === 'youtube' && payload.youtubeId) payload.youtubeId = extractYouTubeId(payload.youtubeId)
    if (source === 'vimeo'   && payload.vimeoId)   payload.vimeoId   = extractVimeoId(payload.vimeoId)
    if (typeof tagsRaw === 'string') payload.tags = tagsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    if (!payload.project) payload.project = null   // Mongoose rejects "" for ObjectId
    if (isNew) await video.create(payload)
    else       await video.update(initial._id, payload)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-2xl border border-line bg-bg-2 p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl">{isNew ? 'Add video' : 'Edit video'}</h2>
          <button type="button" onClick={onClose} className="text-ink-mute hover:text-saffron">close ×</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <F label="Title"><input {...register('title', { required: true })} className={I} /></F>
          <F label="Slug"><input {...register('slug', { required: true })} className={I} placeholder="namkeen-republic-launch" /></F>
          <F label="Client"><input {...register('client')} className={I} /></F>
          <F label="Hindi label"><input {...register('deva')} className={I} placeholder="नमकीन" /></F>
          <F label="Category"><select {...register('category')} className={I}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></F>
          <F label="Year"><input type="number" {...register('year', { valueAsNumber: true })} className={I} /></F>
          <F label="Duration (seconds)"><input type="number" {...register('duration', { valueAsNumber: true })} className={I} /></F>
          <F label="Order (smaller = first)"><input type="number" {...register('order', { valueAsNumber: true })} className={I} /></F>

          <F label="Playback source" className="md:col-span-2">
            <select {...register('source')} className={I}>
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="mp4">MP4 URL</option>
            </select>
          </F>
          {source === 'youtube' && <F label="YouTube ID or URL" className="md:col-span-2"><input {...register('youtubeId')} className={I} placeholder="dQw4w9WgXcQ or https://youtu.be/dQw4w9WgXcQ" /></F>}
          {source === 'vimeo'   && <F label="Vimeo ID or URL"   className="md:col-span-2"><input {...register('vimeoId')}   className={I} placeholder="123456789 or https://vimeo.com/123456789" /></F>}
          {source === 'mp4'     && <F label="MP4 URL"    className="md:col-span-2"><input {...register('mp4Url')}    className={I} placeholder="https://…/film.mp4" /></F>}

          <F label="Orientation" className="md:col-span-2">
            <select {...register('orientation')} className={I}>
              <option value="landscape">Landscape · 16:9</option>
              <option value="portrait">Portrait · 9:16 (Shorts / Reels)</option>
            </select>
            <span className="block label-tag text-[10px] mt-1.5 normal-case tracking-[.1em] text-ink-mute">Auto-set to portrait when you paste a YouTube Shorts URL. Choose portrait for vertical Vimeo / MP4 clips too.</span>
          </F>

          <ImageUploader
            className="md:col-span-2"
            label="Poster / thumbnail"
            help="Shown on the /reel grid and the featured film. For portrait videos use a vertical 9:16 image; otherwise 16:9."
            field="poster"
            aspectClass="w-40 h-24"
            previewStyle={{ aspectRatio: '16 / 9' }}
            register={register}
            setValue={setValue}
            watch={watch}
          />
          <F label="Poster alt-text" className="md:col-span-2"><input {...register('posterAlt')} className={I} placeholder="Describe the thumbnail for accessibility" /></F>
          <F label="Hover preview MP4 (optional)" className="md:col-span-2"><input {...register('previewUrl')} className={I} placeholder="https://…/preview.mp4" /></F>

          <F label="Linked portfolio project" className="md:col-span-2">
            <ProjectPicker register={register} />
            <span className="block label-tag text-[10px] mt-1.5 normal-case tracking-[.1em] text-ink-mute">Linking a video to a project surfaces it on that project's case study page and pairs them on the homepage.</span>
          </F>

          <F label="Excerpt" className="md:col-span-2"><textarea rows={2} {...register('excerpt')} className={I} /></F>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <span className="label-tag">Credits</span>
              <button type="button" onClick={() => append({ role: '', name: '' })} className="text-saffron text-xs">+ add credit</button>
            </div>
            {fields.map((f, i) => (
              <div key={f.id} className="grid grid-cols-[120px_1fr_auto] gap-2 mb-2">
                <input {...register(`credits.${i}.role`)} className={I} placeholder="Director" />
                <input {...register(`credits.${i}.name`)} className={I} placeholder="Name" />
                <button type="button" onClick={() => remove(i)} className="text-ink-mute hover:text-saffron text-xs">×</button>
              </div>
            ))}
          </div>

          <F label="Tags (comma-separated)" className="md:col-span-2">
            <input
              {...register('tagsRaw')}
              defaultValue={Array.isArray(initial.tags) ? initial.tags.join(', ') : ''}
              className={I}
              placeholder="campaign, food, launch"
            />
          </F>

          <label className="flex items-center gap-2"><input type="checkbox" {...register('featured')} /> <span className="label-tag">Featured</span></label>
          <label className="flex items-center gap-2"><input type="checkbox" {...register('published')} defaultChecked={initial.published ?? true} /> <span className="label-tag">Published</span></label>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-3 border border-line text-[12px] tracking-[.24em] uppercase">Cancel</button>
          <button disabled={isSubmitting} className="px-5 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard">
            {isSubmitting ? 'Saving…' : (isNew ? 'Create →' : 'Save →')}
          </button>
        </div>
      </form>
    </div>
  )
}

const I = 'w-full bg-transparent border border-line py-2.5 px-3 text-ink outline-none focus:border-saffron'
function F({ label, children, className = '' }) {
  return <label className={`block ${className}`}><span className="label-tag block mb-1.5">{label}</span>{children}</label>
}

function ProjectPicker({ register }) {
  const [projects, setProjects] = useState([])
  useEffect(() => { portfolio.list().then(setProjects).catch(() => {}) }, [])
  return (
    <select {...register('project')} className={I}>
      <option value="">— None —</option>
      {projects.map((p) => (
        <option key={p._id} value={p._id}>{p.title} {p.year ? `· ${p.year}` : ''} {p.category ? `· ${p.category}` : ''}</option>
      ))}
    </select>
  )
}
