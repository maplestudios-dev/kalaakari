import 'dotenv/config'
import path from 'node:path'
import fsp from 'node:fs/promises'
import crypto from 'node:crypto'
import mongoose from 'mongoose'
import { PAGES_DIR, PAGES_REL, mb } from '../lib/pageStore.js'

/**
 * One-off migration: custom pages used to store their markup inline in the
 * Mongo document (capped at BSON's 16 MB). Move each page's `html` to a file
 * under uploads/pages/ and replace it with `htmlPath` + `bytes`.
 *
 *   node src/scripts/migrate-pages-to-disk.js
 *
 * Idempotent — pages already carrying an htmlPath are skipped, so re-running
 * after a partial failure picks up only what is left. Works on the raw
 * collection because the Mongoose schema no longer declares `html`.
 */
async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✓ connected to', process.env.MONGODB_URI)

  const col = mongoose.connection.db.collection('pages')
  const docs = await col.find({}).toArray()

  let moved = 0, skipped = 0, empty = 0
  for (const doc of docs) {
    const label = `"${doc.title || '(untitled)'}" (/${doc.slug})`

    if (doc.htmlPath) { console.log(`  – skip ${label} — already on disk`); skipped++; continue }

    if (!doc.html) {
      // Nothing to move, but it still needs the new fields to be readable.
      await col.updateOne({ _id: doc._id }, { $set: { htmlPath: '', bytes: 0 }, $unset: { html: '' } })
      console.log(`  – ${label} had no markup — fields initialised`)
      empty++
      continue
    }

    const filename = `${crypto.randomBytes(12).toString('hex')}.html`
    const abs = path.join(PAGES_DIR, filename)
    await fsp.writeFile(abs, doc.html, 'utf8')
    const bytes = (await fsp.stat(abs)).size

    await col.updateOne(
      { _id: doc._id },
      { $set: { htmlPath: path.posix.join(PAGES_REL, filename), bytes }, $unset: { html: '' } }
    )
    console.log(`  ✓ ${label} → ${PAGES_REL}/${filename} (${mb(bytes)})`)
    moved++
  }

  console.log(`\n✓ migration complete — ${moved} moved, ${empty} empty, ${skipped} already done (${docs.length} total)`)
  await mongoose.disconnect()
}

run().catch((e) => { console.error(e); process.exit(1) })
