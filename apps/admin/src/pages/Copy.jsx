import { useEffect, useRef, useState } from 'react'
import { copy } from '../lib/api.js'

export default function CopyPage() {
  const [text, setText] = useState('')
  const [originalText, setOriginalText] = useState('')
  const [versionInfo, setVersionInfo] = useState({ current: null, history: [] })
  const [parseError, setParseError] = useState(null)
  const [savingNote, setSavingNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const fileRef = useRef(null)

  const load = async () => {
    const [cur, v] = await Promise.all([copy.get(), copy.versions()])
    const t = JSON.stringify(cur.copy, null, 2)
    setText(t); setOriginalText(t)
    setVersionInfo(v)
  }
  useEffect(() => { load() }, [])

  const tryParse = (t) => {
    try { JSON.parse(t); return true } catch (e) { setParseError(e.message); return false }
  }

  const onChange = (t) => {
    setText(t); setParseError(null)
    // light validation as you type
    if (t.length > 10) { try { JSON.parse(t) } catch (e) { setParseError(e.message) } }
  }

  const save = async () => {
    if (!tryParse(text)) return
    setSaving(true)
    try {
      const parsed = JSON.parse(text)
      await copy.put(parsed, savingNote || undefined)
      setSavedAt(new Date()); setSavingNote('')
      await load()
    } finally { setSaving(false) }
  }

  const upload = (file) => {
    const reader = new FileReader()
    reader.onload = () => { setText(String(reader.result)); setParseError(null) }
    reader.readAsText(file)
  }

  const download = () => {
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `kalaakaari-copy-v${versionInfo.current?.version || 1}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const resetToDefault = async () => {
    if (!confirm('Replace editor with bundled defaults? (You still have to Save to apply.)')) return
    const d = await copy.default()
    setText(JSON.stringify(d, null, 2))
  }

  const restore = async (v) => {
    if (!confirm(`Restore site copy to v${v}? Current copy will be archived in history.`)) return
    await copy.restore(v)
    await load()
  }

  const dirty = text !== originalText

  return (
    <>
      <header className="flex items-end justify-between mb-8">
        <div>
          <div className="label-tag">CMS · Site Copy</div>
          <h1 className="font-display text-5xl mt-2">JSON copywriting</h1>
          <p className="text-ink-mute text-sm mt-2 max-w-2xl">
            Every editable string on the public site lives here. Save to publish — the live site picks up changes on next page load.
          </p>
        </div>
        <div className="text-right">
          <div className="label-tag">Current</div>
          <div className="font-display text-2xl">v{versionInfo.current?.version || 1}</div>
          {versionInfo.current?.updatedByName && (
            <div className="text-xs text-ink-mute mt-1">by {versionInfo.current.updatedByName}</div>
          )}
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => fileRef.current?.click()} className="px-3 py-2 border border-line text-[11px] tracking-[.2em] uppercase hover:bg-ink hover:text-bg">Upload JSON ↑</button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <button onClick={download} className="px-3 py-2 border border-line text-[11px] tracking-[.2em] uppercase hover:bg-ink hover:text-bg">Download ↓</button>
            <button onClick={resetToDefault} className="px-3 py-2 border border-line text-[11px] tracking-[.2em] uppercase hover:bg-ink hover:text-bg">Load defaults</button>
            <button onClick={() => { try { setText(JSON.stringify(JSON.parse(text), null, 2)) } catch (e) { setParseError(e.message) } }} className="px-3 py-2 border border-line text-[11px] tracking-[.2em] uppercase hover:bg-ink hover:text-bg">Format</button>
          </div>

          <textarea
            value={text}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            className={`w-full font-mono text-xs leading-relaxed p-4 bg-bg border ${parseError ? 'border-saffron' : 'border-line'} text-ink resize-y focus:border-saffron outline-none`}
            style={{ minHeight: 560 }}
          />

          {parseError && <p className="text-saffron text-xs mt-2">JSON error: {parseError}</p>}

          <div className="flex items-center gap-3 mt-4">
            <input
              value={savingNote}
              onChange={(e) => setSavingNote(e.target.value)}
              placeholder="Version note (optional)"
              className="flex-1 bg-transparent border border-line px-3 py-2.5 text-sm outline-none focus:border-saffron"
            />
            <button
              disabled={!dirty || !!parseError || saving}
              onClick={save}
              className="px-6 py-3 bg-saffron text-bg text-[12px] tracking-[.24em] uppercase hover:bg-mustard disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : (dirty ? 'Publish copy →' : 'No changes')}
            </button>
          </div>
          {savedAt && <p className="text-mustard text-xs mt-2">✓ Published at {savedAt.toLocaleTimeString()}</p>}
        </div>

        <aside className="border border-line bg-bg-2 p-5 h-fit">
          <div className="label-tag mb-4">Version history</div>
          {versionInfo.history.length === 0 && <p className="text-ink-mute text-xs">No prior versions yet.</p>}
          <ul className="space-y-3">
            {versionInfo.history.map((h) => (
              <li key={h.version} className="border-b border-line pb-3">
                <div className="flex items-center justify-between">
                  <div className="font-display text-xl text-mustard">v{h.version}</div>
                  <button onClick={() => restore(h.version)} className="text-saffron text-xs hover:underline">restore</button>
                </div>
                {h.updatedByName && <div className="text-xs text-ink-mute mt-1">{h.updatedByName}</div>}
                <div className="text-[10px] text-ink-mute mt-0.5">{new Date(h.createdAt).toLocaleString()}</div>
                {h.note && <div className="text-xs mt-1">{h.note}</div>}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  )
}
